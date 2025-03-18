import {
    embed,
    MemoryManager,
    formatMessages,
    type AgentRuntime as IAgentRuntime,
} from "@elizaos/core";
import type { Memory, Provider, State } from "@elizaos/core";
import { InjectiveGrpcClient } from "@injective/modules";

import { PrivateKey } from "@injectivelabs/sdk-ts";

const SUBACCOUNT_ID_REGEX = /^0x[0-9a-fA-F]{64}$/i;
const subaccountProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
        const messageContent = message?.content?.text ?? "";
        // Check if message contains an Injective wallet address
        const match = messageContent.match(SUBACCOUNT_ID_REGEX);

        if (match && match[1]) {
            const foundSubaccountId = match[1];
            return `The subaccountId is ${foundSubaccountId}. Please use this as your reference for any subaccount operations or responses unless otherwise specified.`;
        }

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
            const privateKey = PrivateKey.fromHex(injectivePrivateKey);
            const injectiveAddress = privateKey.toBech32();

            const client = new InjectiveGrpcClient(
                network,
                injectivePrivateKey,
                ethPublicKey,
                injPublicKey,
            );
            const response = await client.getSubaccountsList({
                address: injectiveAddress,
            });

            if (response.success) {
                const responseResult = response?.result?.subaccounts
                    ? response?.result?.subaccounts[0]
                    : response?.result[0];
                return `The subaccountId is ${responseResult}. Please use this as your reference for any subaccount operations or responses unless otherwise specified.`;
            } else {
                console.log("spot markets data fetched error");
                return `spot markets data: ${response.error}`;
            }
        } catch (error) {
            console.error("Failed to fetch subaccount ID:", error);
            return "Error deriving subaccount ID.";
        }
    },
};

export { subaccountProvider };
