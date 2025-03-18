import {
    embed,
    MemoryManager,
    formatMessages,
    type AgentRuntime as IAgentRuntime,
} from "@elizaos/core";
import type { Memory, Provider, State } from "@elizaos/core";
import { InjectiveGrpcClient } from "@injective/modules";
import { getSpotMarkets } from "@injective/modules/exchange";

const spotMarketsProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
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

            const client = new InjectiveGrpcClient(
                network,
                injectivePrivateKey,
                ethPublicKey,
                injPublicKey,
            );
            const response = await client.getSpotMarkets();
            if (response.success) {
                const responseResult = JSON.stringify(response.result);
                return `The spot markets data is ${responseResult}. Please use this as your reference for any spot markets data operations or responses unless otherwise specified.`;
            } else {
                return `spot markets data: ${response.error}`;
            }
        } catch (error) {
            console.error("Failed to fetch markets data:", error);
            return "Error fetching markets data.";
        }
    },
};

export { spotMarketsProvider };
