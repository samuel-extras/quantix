import {
    elizaLogger,
    Evaluator,
    IAgentRuntime,
    Memory,
    State,
    HandlerCallback,
} from "@elizaos/core";

export const ppmMonitor: Evaluator = {
    name: "MONNITOR_PMM",
    similes: ["PMM_RETRIGGER"],
    alwaysRun: true,
    description:
        "Schedules and monitors ongoing pmm actions to ensure continuous operation.",
    validate: async (
        runtime: IAgentRuntime,
        message: Memory,
    ): Promise<boolean> => true,
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        // _options: { [key: string]: unknown },
        // callback?: HandlerCallback,
    ) => {
        console.log("Running ppmMonitor evaluator");
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }
        // test
        const instervalMs = 10 * 1000;
        elizaLogger.log(`Using time threshold: ${instervalMs} miliseconds`);
        await new Promise((resolve) => setTimeout(resolve, instervalMs));
        function runEveryTenSeconds() {
            console.log(
                "Function is running at",
                new Date().toLocaleTimeString(),
            );
        }

        // Run immediately (optional)
        runEveryTenSeconds();
    },
    examples: [],
};
