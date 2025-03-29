import InjectiveActions from "./action";
import type { Plugin } from "@elizaos/core";
import { spotMarketsProvider, walletProvider } from "./providers";
import { orderbookProvider } from "./providers/orderbook";
import { subaccountProvider } from "./providers/subaccount";
import { ppmMonitor } from "./evaluators/ppmMonitor";
export const injectivePlugin: Plugin = {
    name: "injective",
    description: "A plugin for interacting with the Injective blockchain",
    actions: InjectiveActions,
    evaluators: [ppmMonitor],
    providers: [
        walletProvider,
        subaccountProvider,
        spotMarketsProvider,
        // orderbookProvider,
    ], //TODO: Integrate with injective-trader to run MM and Taking Strats
};

// import {
//     ChainClient,
//     PrivateKeyWallet,
//     DEFAULT_GAS_LIMIT,
//     DEFAULT_STD_FEE,
//     MsgCreateSpotMarketOrder,
//     OrderType,
//     Network,
//     SpotOrder,
//     SpotMarketOrder,
//     SpotMarketInfoResponse,
//     MarketStatus,
//   } from '@injectivelabs/sdk-ts';
//   import {
//     BigNumber,
//     BigNumberInBase,
//     BigNumberInWei,
//   } from '@injectivelabs/utils';
//   import {
//     MarketMakingParams,
//     calculateBidAsk, // Assuming you have the calculateBidAsk function from the previous example
//   } from './market_making_logic'; // Import your market making logic

//   // **Configuration (Important:  Securely manage your private key!)**
//   const PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE'; // NEVER commit this to source control!
//   const NETWORK = Network.Testnet; // Or Network.Mainnet
//   const INJECTIVE_ENDPOINT = 'https://testnet.sentry.injectivelabs.dev:443';  // Replace with the appropriate endpoint for your network

//   const MARKET_SYMBOL = 'BTC/USDT'; // The market you want to trade on

//   // **Risk Management and Trading Parameters**
//   const ORDER_QUANTITY = 0.01; // Example order quantity (in base currency, e.g., BTC)
//   const MIN_PROFIT_MARGIN = 0.001;  // 0.1% profit margin. Adjust as needed.
//   const INVENTORY_TARGET = 0;  // Target a neutral inventory

//   //**Constants */
//   const CANCEL_RETRY_TIMES = 3;
//   const CANCEL_ORDER_GAS = 60_000;

//   class InjectiveMarketMaker {
//     private readonly client: ChainClient;
//     private readonly wallet: PrivateKeyWallet;
//     private readonly address: string;
//     private marketId: string;
//     private basePrecision: number;
//     private quotePrecision: number;
//     private quoteDenom: string;
//     private baseDenom: string;
//     private minQuantityTickSize: number;
//     private minPriceTickSize: number;
//     private bidOrderHash: string | null = null;
//     private askOrderHash: string | null = null;
//     private currentInventory: number = 0;

//     constructor(privateKey: string, private readonly marketSymbol: string) {
//       this.wallet = new PrivateKeyWallet(privateKey);
//       this.address = this.wallet.address;
//       this.client = new ChainClient({ network: NETWORK, endpoint: INJECTIVE_ENDPOINT });
//     }

//     async initialize(): Promise<void> {
//       try {
//         const marketInfo = await this.getMarketInfo(this.marketSymbol);

//         if (!marketInfo) {
//           throw new Error(`Market ${this.marketSymbol} not found.`);
//         }

//         this.marketId = marketInfo.marketId;
//         this.basePrecision = marketInfo.baseToken.decimals;
//         this.quotePrecision = marketInfo.quoteToken.decimals;
//         this.baseDenom = marketInfo.baseToken.symbol;
//         this.quoteDenom = marketInfo.quoteToken.symbol;

//         const quantityTickSize = marketInfo.quantityTickSize;
//         const priceTickSize = marketInfo.priceTickSize;

//         this.minQuantityTickSize = new BigNumber(quantityTickSize)
//             .toSignificantFigures();
//         this.minPriceTickSize = new BigNumber(priceTickSize).toSignificantFigures();

//         console.log(`Initialized for market: ${this.marketSymbol} (${this.marketId})`);
//         console.log(`Base Denom: ${this.baseDenom}, Quote Denom: ${this.quoteDenom}`);
//         console.log(`Base Precision: ${this.basePrecision}, Quote Precision: ${this.quotePrecision}`);
//         console.log(`Min Quantity Tick Size: ${this.minQuantityTickSize}, Min Price Tick Size: ${this.minPriceTickSize}`);

//       } catch (error: any) {
//         console.error('Initialization error:', error);
//         throw error; // Re-throw to stop the bot if initialization fails
//       }
//     }

//     private async getMarketInfo(marketSymbol: string): Promise<SpotMarketInfoResponse | undefined> {
//       try {
//         const markets = await this.client.fetchSpotMarkets();
//         const market = markets.find(m => m.baseToken.symbol + '/' + m.quoteToken.symbol === marketSymbol);

//         if (!market) {
//           console.log(`Market ${marketSymbol} not found.`);
//           return undefined;
//         }

//         return market;
//       } catch (error) {
//         console.error(`Error fetching market info for ${marketSymbol}:`, error);
//         return undefined;
//       }
//     }

//     async start(): Promise<void> {
//       console.log('Starting market making loop...');
//       await this.maintainOrders(); // Kick off the initial placement

//       //  Potentially use a setInterval or a more sophisticated approach like a
//       //  reactive stream (e.g., RxJS) for continuous monitoring and adjustments.
//       //  setInterval(async () => {
//       //     await this.maintainOrders();
//       //  }, 5000); // Check and adjust orders every 5 seconds
//     }

//     private async getMidPrice(): Promise<number> {
//       //**TODO: Implement a robust mid-price calculation
//       //  This is a placeholder. A real implementation would:
//       //  1. Fetch the current order book from the Injective API.
//       //  2. Calculate a weighted average of the best bid and ask prices.
//       //  3. Handle cases where the order book is empty or has insufficient depth.

//       try {
//         const orderbook = await this.client.fetchSpotOrderbookV2(this.marketId);
//         const bestBidPrice = orderbook.bids[0].price;
//         const bestAskPrice = orderbook.asks[0].price;

//         if (!bestBidPrice || !bestAskPrice) {
//           console.warn("Could not determine midprice due to empty orderbook")
//           return 0;
//         }

//         const midPrice = (Number(bestBidPrice) + Number(bestAskPrice)) / 2;

//         return midPrice;
//       } catch (error) {
//         console.error("Error fetching or calculating midPrice", error);
//         return 0;
//       }

//     }

//     private async adjustInventory(quantity: number, isBuy: boolean): Promise<void> {
//       // Adjust the inventory based on filled orders
//       if (isBuy) {
//         this.currentInventory += quantity;
//       } else {
//         this.currentInventory -= quantity;
//       }

//       console.log(`Inventory adjusted. Current Inventory: ${this.currentInventory}`);
//     }

//     private async maintainOrders(): Promise<void> {
//       try {
//         const midPrice = await this.getMidPrice();

//         if (midPrice === 0) {
//           console.warn("Skipping order placement due to invalid midPrice");
//           return; // Don't place orders if the mid-price is invalid
//         }

//         const params: MarketMakingParams = {
//           midPrice: midPrice,
//           baseSpread: 0.002 * midPrice,  // Example spread: 0.2% of mid-price
//           inventory: this.currentInventory - INVENTORY_TARGET, // Adjust for current inventory
//           volatility: 0.01, // Example: 1% volatility
//           lambdaParam: 0.01,
//           gammaParam: 0.1,
//         };

//         const { bidPrice, askPrice } = calculateBidAsk(params);

//         // Check if the calculated bid and ask prices provide sufficient profit margin.
//         if (askPrice <= bidPrice * (1 + MIN_PROFIT_MARGIN)) {
//           console.warn("Calculated prices do not provide sufficient profit margin. Skipping order placement.");
//           return;
//         }

//         const adjustedBidPrice = this.adjustPriceToTickSize(bidPrice);
//         const adjustedAskPrice = this.adjustPriceToTickSize(askPrice);

//         //check and cancel the old order
//         await this.cancelAndReplaceOrders(adjustedBidPrice, adjustedAskPrice);

//       } catch (error) {
//         console.error('Error maintaining orders:', error);
//       }
//     }

//     private adjustPriceToTickSize(price: number): number {
//       // Adjust the price to the nearest tick size allowed by the market.
//       const tickSizeBN = new BigNumber(this.minPriceTickSize);
//       const priceBN = new BigNumber(price);

//       const adjustedPriceBN = priceBN.dividedBy(tickSizeBN).integerValue(BigNumber.ROUND_HALF_UP).multipliedBy(tickSizeBN);
//       return adjustedPriceBN.toNumber();
//     }

//     private adjustQuantityToTickSize(quantity: number): number {
//       // Adjust the quantity to the nearest tick size allowed by the market.
//       const tickSizeBN = new BigNumber(this.minQuantityTickSize);
//       const quantityBN = new BigNumber(quantity);

//       const adjustedQuantityBN = quantityBN.dividedBy(tickSizeBN).integerValue(BigNumber.ROUND_HALF_UP).multipliedBy(tickSizeBN);

//       return adjustedQuantityBN.toNumber();
//     }

//     private async placeOrder(price: number, quantity: number, isBuy: boolean, orderHashToUpdate: string | null): Promise<string | undefined> {
//       try {
//         const adjustedQuantity = this.adjustQuantityToTickSize(quantity);

//         if (adjustedQuantity <= 0) {
//           console.warn(`Adjusted quantity is zero. Skipping order placement.`);
//           return undefined;
//         }

//         const order = this.createSpotMarketOrder({
//           price: price,
//           quantity: adjustedQuantity,
//           isBuy: isBuy,
//           marketId: this.marketId,
//           orderHashToUpdate: orderHashToUpdate
//         });

//         const res = await this.client.submitSpotOrder(order, this.wallet);

//         if (res.code) {
//           console.error(`Order placement failed: ${res.rawLog}`);
//           return undefined;
//         }

//         const orderHash = res.data;

//         console.log(`Order placed successfully: ${isBuy ? 'Buy' : 'Sell'} - Price: ${price}, Quantity: ${adjustedQuantity}, orderHash: ${orderHash}`);

//         return orderHash;

//       } catch (error: any) {
//         console.error(`Error placing ${isBuy ? 'buy' : 'sell'} order:`, error);
//         return undefined;
//       }
//     }

//     private createSpotMarketOrder({ price, quantity, isBuy, marketId, orderHashToUpdate }: {
//       price: number,
//       quantity: number,
//       isBuy: boolean,
//       marketId: string,
//       orderHashToUpdate: string | null
//     }): SpotMarketOrder {
//       const actualQuantity = new BigNumberInBase(quantity).toWei(this.basePrecision).toFixed();
//       const actualPrice = new BigNumberInBase(price).toWei(this.quotePrecision).toFixed();

//       const order = {
//         orderType: isBuy ? OrderType.BUY : OrderType.SELL,
//         marketId: marketId,
//         quantity: actualQuantity,
//         price: actualPrice,
//         feeRecipient: this.address,
//         cid: "" //leave the cid blank for testing
//       } as SpotOrder;

//       const message = MsgCreateSpotMarketOrder.fromPartial({
//         order: order,
//         sender: this.address,
//         orderHashToUpdate: orderHashToUpdate ? orderHashToUpdate : ""
//       });

//       return {
//         message,
//         orderType: isBuy ? OrderType.BUY : OrderType.SELL,
//         marketId: marketId,
//         quantity: actualQuantity,
//         price: actualPrice,
//       } as SpotMarketOrder;
//     }

//     private async cancelOrder(orderHash: string): Promise<boolean> {
//       // Cancels the old order on the chain
//       try {
//         // retry cancel order up to 3 times
//         for (let i = 0; i <= CANCEL_RETRY_TIMES; i++) {
//           try {
//             const res = await this.client.cancelSpotOrder(
//                 {
//                   marketId: this.marketId,
//                   orderHash,
//                   sender: this.address,
//                 },
//                 this.wallet,
//                 {
//                   gas: CANCEL_ORDER_GAS,
//                 },
//             );

//             if (res.code) {
//               console.error(`Order cancellation failed: ${res.rawLog}`);
//               return false; // Cancellation failed
//             }

//             console.log(`Order cancelled successfully. OrderHash: ${orderHash}`);
//             return true;

//           } catch (e: any) {
//             if (i < CANCEL_RETRY_TIMES) {
//               //retry if cancel order fails and is not exceeding the retry times
//               console.log(`Retry ${i + 1}  to cancel order  due to ${e.message}`);
//               continue;
//             }

//             throw e; //rethrow the error when reach retry limit
//           }
//         }
//       } catch (error: any) {
//         console.error(`Error cancelling order with hash ${orderHash}:`, error);
//         return false;
//       }
//       return false;
//     }

//     private async cancelAndReplaceOrders(bidPrice: number, askPrice: number): Promise<void> {
//       let needsNewBuyOrder: boolean = false;
//       let needsNewSellOrder: boolean = false;

//       if (this.bidOrderHash != null) {
//         needsNewBuyOrder = true;
//         // Check order book to see if the buy order is valid
//         const orderbook = await this.client.fetchSpotOrderbookV2(this.marketId);
//         const currentBid = orderbook.bids.find((bid) => bid.orderHash == this.bidOrderHash);
//         if (currentBid != null) {
//           if (Number(currentBid.price) == bidPrice) {
//             needsNewBuyOrder = false;
//           } else {
//             //cancel and replace
//             const cancelSuccess = await this.cancelOrder(this.bidOrderHash);

//             if (cancelSuccess) {
//               console.log(`Cancelling existing bid order with hash ${this.bidOrderHash} due to price change`);
//               this.bidOrderHash = null;
//             } else {
//               //If the order cannot be cancelled, just set to null, to replace.
//               //We'll check the new order in the trade checker and attempt to re-sync there.
//               this.bidOrderHash = null;
//             }
//           }
//         } else {
//           this.bidOrderHash = null; //Order not found. We'll replace
//         }
//       } else {
//         needsNewBuyOrder = true;
//       }

//       if (this.askOrderHash != null) {
//         needsNewSellOrder = true;
//         // Check order book to see if the buy order is valid
//         const orderbook = await this.client.fetchSpotOrderbookV2(this.marketId);
//         const currentAsk = orderbook.asks.find((ask) => ask.orderHash == this.askOrderHash);

//         if (currentAsk != null) {
//           if (Number(currentAsk.price) == askPrice) {
//             needsNewSellOrder = false;
//           } else {
//             //cancel and replace
//             const cancelSuccess = await this.cancelOrder(this.askOrderHash);

//             if (cancelSuccess) {
//               console.log(`Cancelling existing ask order with hash ${this.askOrderHash} due to price change`);
//               this.askOrderHash = null;
//             } else {
//               this.askOrderHash = null;
//             }
//           }
//         } else {
//           this.askOrderHash = null; //Order not found. We'll replace
//         }
//       } else {
//         needsNewSellOrder = true;
//       }

//       let newBuyOrderHash = this.bidOrderHash;
//       let newSellOrderHash = this.askOrderHash;

//       // Place new buy and sell orders
//       if (needsNewBuyOrder) {
//         newBuyOrderHash = await this.placeOrder(bidPrice, ORDER_QUANTITY, true, this.bidOrderHash);
//       }

//       if (needsNewSellOrder) {
//         newSellOrderHash = await this.placeOrder(askPrice, ORDER_QUANTITY, false, this.askOrderHash);
//       }

//       this.bidOrderHash = newBuyOrderHash ? newBuyOrderHash : this.bidOrderHash;
//       this.askOrderHash = newSellOrderHash ? newSellOrderHash : this.askOrderHash;

//       //Check for trades.  If a trade happend, recalculate price again to see if it is still valid.
//       this.tradeRecalculator();

//       // Trade checker every 1 second to check for old/zombie orders
//       setInterval(() => {
//         this.tradeChecker();
//       }, 1000);
//     }

//     async tradeChecker() {
//       //**TODO: Implement trade checker function
//       // Check if orders are actually filled.

//       if (this.bidOrderHash == null && this.askOrderHash == null) {
//         console.log("No more orders to check");
//         return;
//       }

//       // 1. Check Order Status: Fetch the status of your bid and ask orders using the Injective API.
//       try {
//         const orderbook = await this.client.fetchSpotOrderbookV2(this.marketId);

//         if (this.bidOrderHash != null) {
//           const currentBid = orderbook.bids.find((bid) => bid.orderHash == this.bidOrderHash);
//           if (currentBid == null) {
//             this.bidOrderHash = null;
//             console.log("Old bid order has not been replaced, removing");
//             this.tradeRecalculator();
//           }
//         }

//         if (this.askOrderHash != null) {
//           const currentAsk = orderbook.asks.find((ask) => ask.orderHash == this.askOrderHash);
//           if (currentAsk == null) {
//             this.askOrderHash = null;
//             console.log("Old ask order has not been replaced, removing");
//             this.tradeRecalculator();
//           }
//         }
//       } catch (err) {
//         //On error just recalculate. Worst case it creates a bunch more orders, which will be fine.
//         console.log("Error when performing trade checker, recalculate for safety");
//         this.tradeRecalculator();
//       }
//     }

//     async tradeRecalculator() {
//       //**TODO: Implement trade recalculator
//       //Call maintainOrders so we can kick off the recalculation loop again.
//       console.log("Triggering recalculation");
//       await this.maintainOrders();
//     }
//   }

//   async function main() {
//     const marketMaker = new InjectiveMarketMaker(PRIVATE_KEY, MARKET_SYMBOL);

//     try {
//       await marketMaker.initialize();
//       await marketMaker.start();
//     } catch (error) {
//       console.error('Market maker failed to start:', error);
//     }
//   }

//   main();
