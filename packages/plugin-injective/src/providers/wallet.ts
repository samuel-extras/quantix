import {
    embed,
    MemoryManager,
    formatMessages,
    type AgentRuntime as IAgentRuntime,
} from "@elizaos/core";
import type { Memory, Provider, State } from "@elizaos/core";

import { PrivateKey } from "@injectivelabs/sdk-ts";

// const INJECTIVE_ADDRESS_REGEX = /(inj[0-9a-z]{39})/i;
const INJECTIVE_ADDRESS_REGEX = /^inj1(?:[a-z0-9]{38}|[a-z0-9]{58})$/i;

const walletProvider: Provider = {
    get: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
        const messageContent = message?.content?.text ?? "";
        // Check if message contains an Injective wallet address
        const match = messageContent.match(INJECTIVE_ADDRESS_REGEX);

        if (match && match[1]) {
            const foundAddress = match[1];
            return `The wallet address is ${foundAddress}. Please use this as your reference for any wallet address operations or responses unless otherwise specified.`;
        }

        // No address found in message, derive it from private key
        try {
            const injectivePrivateKey = runtime.getSetting(
                "INJECTIVE_PRIVATE_KEY",
            );
            const privateKey = PrivateKey.fromHex(injectivePrivateKey);
            const injectiveAddress = privateKey.toBech32();
            return `The wallet address is ${injectiveAddress}. Please use this as your reference for any wallet address operations or responses unless otherwise specified.`;
        } catch (error) {
            console.error("Failed to derive Injective wallet address:", error);
            return "Error deriving Injective wallet address.";
        }
    },
};

export { walletProvider };
