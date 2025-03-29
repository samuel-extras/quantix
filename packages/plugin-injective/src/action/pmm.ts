import {
    Action,
    composeContext,
    elizaLogger,
    generateObjectDeprecated,
    generateText,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@elizaos/core";
import { InjectiveGrpcClient } from "@injective/modules";
import { createPMMTemplate } from "@injective/template";
import { BigNumberInBase } from "@injectivelabs/utils";
import type {
    InjectiveExchangeV1Beta1Exchange,
    InjectiveOracleV1Beta1Oracle,
} from "@injectivelabs/core-proto-ts";
import type { OrderSide, OrderState } from "@injectivelabs/ts-types";
import { MidPriceAndTOB } from "@injectivelabs/core-proto-ts/cjs/injective/exchange/v1beta1/exchange";

export const PMMAction: Action = {
    name: "CREATE_PURE_MARKET_MAKING",
    similes: [
        "CREATE_PMM",
        "RUN_PMM",
        "USE_PMM",
        "RUN_PURE_MARKET_MAKING",
        "USE_PURE_MARKET_MAKING",
        "USE_PURE_MARKET_MAKING_STRATEGY",
        "PURE_MARKET_MAKING",
        "TRADE_WITH_PMM",
        "PMM",
        "MARKET_MAKING_STRATEGY",
        "TRADE_WITH_MARKET_MAKING_STRATEGY",
    ],
    description: "run a pure market making strategy",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        // Validation logic
        return true;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback,
    ) => {
        // Global state variables
        let currentOrders: string[] = [];
        let inventory: number = 0;
        let midPrice: number = 0;
        let exchangeClient: InjectiveGrpcClient;

        // Implementation logic
        elizaLogger.debug(`create action: CREATE_PURE_MARKET_MAKER`);
        // 1. Compose or update the state
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        console.log("State", { state });
        // 2. Compose a context from the given template
        const context = composeContext({
            state,
            template: createPMMTemplate,
        });

        console.log("Context:", context);

        // 3. Use the AI model to generate content based on the context
        const rawParams = await generateObjectDeprecated({
            runtime,
            context,
            modelClass: ModelClass.LARGE,
        });

        console.log("Raw Params:", rawParams);

        // const rawParam = await generateShouldRespond({
        //     runtime,
        //     context,
        //     modelClass: ModelClass.LARGE,
        // });

        function cleanParams(params) {
            const cleanedParams = {};

            // Loop through all keys in the original object
            for (const key in params) {
                // Only add to the new object if the value is not "null"
                if (params[key] !== "null") {
                    cleanedParams[key] = params[key];
                }
            }

            return cleanedParams;
        }

        const params: any = cleanParams(rawParams);

        // Calculate bid and ask prices based on current market and inventory
        const calculatePrices = async (): Promise<{
            bidPrice: BigNumberInBase;
            askPrice: BigNumberInBase;
        }> => {
            try {
                // Fetch current market price
                const orderbook = await exchangeClient.getSpotOrderbookV2(
                    params?.marketId,
                );
                // Get best bid/ask
                const bestBid = Number(orderbook.bids[0]?.price || 0);
                const bestAsk = Number(orderbook.asks[0]?.price || 0);
                midPrice = (bestBid + bestAsk) / 2;

                const halfSpreadPercentage = params.spreadPercentage / 2;
                let bidPrice = midPrice * (1 - halfSpreadPercentage / 100);
                let askPrice = midPrice * (1 + halfSpreadPercentage / 100);

                const inventoryRatio = inventory / params.maxInventory;

                if (inventoryRatio > 0) {
                    // If we have positive inventory, make selling more attractive
                    const adjustment = inventoryRatio * 0.1;
                    bidPrice *= 1 - adjustment / 100;
                    askPrice *= 1 - adjustment / 100;
                } else if (inventoryRatio < 0) {
                    // If we have negative inventory, make buying more attractive
                    const adjustment = Math.abs(inventoryRatio) * 0.1;
                    bidPrice *= 1 + adjustment / 100;
                    askPrice *= 1 + adjustment / 100;
                }

                return {
                    bidPrice: new BigNumberInBase(bidPrice),
                    askPrice: new BigNumberInBase(askPrice),
                };
            } catch (error) {
                console.log(`Error calculating prices: ${error.message}`);
                throw error;
            }
        };

        // Cancel existing orders
        const cancelExistingOrders = async () => {
            if (currentOrders.length === 0) return;

            console.log(
                `Cancelling ${currentOrders.length} existing orders...`,
            );

            for (const orderId of currentOrders) {
                try {
                    // marketId: string;
                    // subaccountId: string;
                    // orderHash?: string;
                    // cid?: string;
                    await exchangeClient.msgCancelSpotOrder({
                        marketId: params.marketId,
                        subaccountId: params.subaccountId,
                        orderHash: orderId,
                    });
                    console.log(`Cancelled order ${orderId}`);
                } catch (error) {
                    console.log(
                        `Error cancelling order ${orderId}: ${error.message}`,
                    );
                }
            }

            currentOrders = [];
        };

        // Place new orders
        const placeOrders = async (
            bidPrice: BigNumberInBase,
            askPrice: BigNumberInBase,
        ) => {
            const orderSize = new BigNumberInBase(params.orderSize);
            console.log(
                `Market price: ${midPrice}, Bid: ${bidPrice}, Ask: ${askPrice}, Inventory: ${inventory}`,
            );

            try {
                // marketId: string;
                //     subaccountId: string;
                //     orderType: InjectiveExchangeV1Beta1Exchange.OrderType;
                //     triggerPrice?: string;
                //     feeRecipient: string;
                //     price: string;
                //     quantity: string;
                //     cid?: string;

                // Place bid order
                const bidOrder = await exchangeClient.msgCreateSpotLimitOrder({
                    marketId: params.marketId,
                    subaccountId: params.subaccountId,
                    quantity: orderSize,
                    price: bidPrice,
                    orderType: "BUY",
                });

                currentOrders.push(bidOrder.orderHash);
                console.log(`Placed bid order: ${bidOrder.orderHash}`);

                // Place ask order
                const askOrder = await exchangeClient.msgCreateSpotLimitOrder({
                    marketId: params.marketId,
                    subaccountId: params.subaccountId,
                    quantity: orderSize,
                    price: askPrice,
                    orderType: "SELL",
                });

                currentOrders.push(askOrder.orderHash);
                console.log(`Placed ask order: ${askOrder.orderHash}`);
            } catch (error) {
                console.log(`Error placing orders: ${error.message}`);
            }
        };

        // Update inventory
        const updateInventory = async () => {
            try {
                const subaccountBalance =
                    await exchangeClient.getSubaccountBalancesList({
                        subaccountId: params.subaccountId,
                        denom: params.baseDenom,
                    });

                console.log({ subaccountBalance });

                // inventory = tokenBalance ? parseFloat(tokenBalance.amount) : 0;
                // console.log(`Updated inventory: ${inventory}`);
            } catch (error) {
                console.log(`Error updating inventory: ${error.message}`);
            }
        };

        // Main market making loop
        const marketMakingLoop = async () => {
            try {
                // Update current inventory
                await updateInventory();

                // Calculate prices based on current market and inventory
                const { bidPrice, askPrice } = await calculatePrices();

                // Cancel existing orders
                await cancelExistingOrders();

                // Place new orders
                await placeOrders(bidPrice, askPrice);
            } catch (error) {
                console.log(`Error in market making loop: ${error.message}`);
            }

            // Schedule next update
            setTimeout(marketMakingLoop, params.updateInterval);
        };

        const startMarketMaker = async () => {
            console.log(
                `Starting market maker for ${params.marketId} on Injective...`,
            );

            // Validate market and load necessary details
            // await exchangeClient.getSpotMarketSummary(params.marketId);
            // console.log("Market validated");

            // // Print initial balances
            // const initialBalances = await exchangeClient.getSubaccountBalances(
            //     privateKey.toAddress(),
            // );

            // initialBalances.forEach((balance) => {
            //     console.log(`${balance.denom}: Amount: ${balance.amount}`);
            // });

            // Start market making loop
            await marketMakingLoop();
        };

        // 5. Initialize the Injective client
        try {
            const rawNetwork = runtime.getSetting("INJECTIVE_NETWORK");
            const injectivePrivateKey = runtime.getSetting(
                "INJECTIVE_PRIVATE_KEY",
            );
            const ethPublicKey = runtime.getSetting("EVM_PUBLIC_KEY");
            const injPublicKey = runtime.getSetting("INJECTIVE_PUBLIC_KEY");
            const network = rawNetwork as
                | "MainnetK8s"
                | "MainnetLB"
                | "Mainnet"
                | "MainnetSentry"
                | "MainnetOld"
                | "Staging"
                | "Internal"
                | "TestnetK8s"
                | "TestnetOld"
                | "TestnetSentry"
                | "Testnet"
                | "Devnet1"
                | "Devnet2"
                | "Devnet"
                | "Local";
            if (
                !injectivePrivateKey ||
                (!ethPublicKey && !injPublicKey) ||
                !network
            ) {
                throw new Error("Incorrect configuration");
            }

            exchangeClient = new InjectiveGrpcClient(
                network,
                injectivePrivateKey,
                ethPublicKey,
                injPublicKey,
            );

            await startMarketMaker();

            // 6. Dynamically call the specified functionName on the Injective client
            const method = (exchangeClient as any)[""];
            if (typeof method !== "function") {
                throw new Error(
                    `Method "${""}" does not exist on InjectiveGrpcClient`,
                );
            }
            //Function that the LLM extracted
            console.log(`will pass these params ${JSON.stringify(params)}}`);

            //Need to standardize this context params
            const response = await method(params);
            console.log(
                `Recieved a response from InjectiveGrpcClient , response: ${JSON.stringify(response)}, `,
            );
            // Lets convert the result of the response into something that can be read
            if (response.success) {
                console.log("Cleaning up the response");
                const additionalTemplate = `Extract the response from the following data and transform it into a beautifully formatted, human-readable summary. Ensure the output is exceptionally clear, comprehensive, and visually appealing in string format—the prettiest thing anyone can read. Additionally, for any token amounts provided, convert them from their raw blockchain token standard format (e.g., adjusting for decimals such as 18 for INJ, 6 for USDT, or other common standards) into a human-readable format without decimals. For example, convert 10,000,000,000,000,000,000 INJ to 10 INJ, 10,000,000,000 USDT to 10,000 USDT, and apply similar logic to other tokens based on their typical decimal standards. Specifically, treat any token with an address starting with 'peggy0x' as USDT, assuming it follows USDT’s standard 6 decimals for conversion, unless explicitly stated otherwise.`;
                const responseResult = JSON.stringify(response.result);
                const newContext = `${additionalTemplate}\n${responseResult}`;
                const totalContext = `Previous chat context:${context} \n New information : ${newContext}`;
                console.log(
                    `Got context, now will pass it on to llm ${totalContext}`,
                );
                const responseContent = await generateText({
                    runtime,
                    context: totalContext,
                    modelClass: ModelClass.SMALL,
                });

                console.log("Response content:", responseContent);
                if (callback)
                    callback({
                        text: `Operation ${name} succeeded, ${responseContent}.`,
                        content: response.result,
                    });
            } else {
                // 7. Trigger any callback with failure info
                if (callback) {
                    callback({
                        text: `Operation ${name} failed.\n${response.result}`,
                        content: response.result,
                    });
                }
            }

            // Return true if code == 0 (success), else false
            return response.result.code === 0;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Error in ${name}: ${(error as Error).message}`,
                    content: { error: (error as Error).message },
                });
            }
            return false;
        }
        // return true;
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "I want to run a pure market making strategy on INJ/USDT.",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Pure market making has been successfully deployed for INJ/USDT with your custom settings!",
                    action: "CREATE_PURE_MARKET_MAKING",
                },
            },
            // {
            //     user: "{{agent}}",
            //     content: {
            //         text: "Sure! Please provide the trading pair (e.g. INJ/USDT) or market ID you'd like to trade. Optionally, you can specify:\n\n- Subaccount ID (if different from default)\n- Spread (e.g. 0.5)\n- Order amount\n- Order refresh time in ms\n- Inventory target base percentage\n- Inventory skew (true or false)",
            //     },
            // },
            // {
            //     user: "{{user1}}",
            //     content: {
            //         text: "INJ/USDT, spread 0.3, order amount 2, refresh time 15000, inventory skew true",
            //     },
            // },
            // {
            //     user: "{{agent}}",
            //     content: {
            //         text: "Got it! Here's your configuration:\n\n- Market: INJ/USDT\n- Spread: 0.003 // 0.3%\n- Order Amount: 2 INJ\n- Order Refresh Time: 15000ms\n- Inventory Target Base Pct: 0.5 (default)\n- Inventory Skew Enabled: true\n\nShall I proceed with these settings?",
            //     },
            // },
            // {
            //     user: "{{user1}}",
            //     content: { text: "Yes, proceed." },
            // },
            // {
            //     user: "{{agent}}",
            //     content: {
            //         text: "Pure market making has been successfully deployed for INJ/USDT with your custom settings!",
            //         action: "CREATE_PURE_MARKET_MAKING",
            //     },
            // },
        ],
    ],
};
