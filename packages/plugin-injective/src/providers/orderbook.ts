import {
    embed,
    MemoryManager,
    formatMessages,
    type AgentRuntime as IAgentRuntime,
} from "@elizaos/core";
import type { Memory, Provider, State } from "@elizaos/core";
import { InjectiveGrpcClient } from "@injective/modules";

const orderbookProvider: Provider = {
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
            const response = await client.getSpotOrderbooksV2({
                marketIds: [
                    "0x0611780ba69656949525013d947713300f56c37b6175e02f26bffa495c3208fe",
                ],
            });

            return `inj/usdt orderbook: ${response.result}`;
        } catch (error) {
            console.error("Failed to derive Injective wallet address:", error);
            return "Error deriving Injective wallet address.";
        }
    },
};

export { orderbookProvider };
