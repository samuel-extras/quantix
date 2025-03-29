export const createPMMTemplate = `
Extract the following details for creating pure market making order:
- **tradingPair** (string): the token trading pair user likes to trade (e.g. INJ/USDT)
- **marketId** (string, optional): the market ID of token trading pair
- **subaccountId** (string, optional): Subaccount ID
- **bidSpread** (string, optional): how far away from mid price to place the first bid order
- **askSpread** (string, optional): how far away from mid price to place the first ask order
- **orderAmount** (string, optional): amount of the base token to trade per order
- **orderRefreshTime** (string, , optional): how often to cancel and replace bid and ask orders in seconds
- **inventoryTargetBasePct** (string, optional): inventoryTargetBasePct
- **inventorySkewEnabled** (boolean, optional): should enable inventory skew

Provide the request in the following JSON format:

\`\`\`json
{
    "marketId": "0x...",
    "subaccountId": "0x...",
    "feeRecipient": "inj1..."
    "tradingPair": "INJ/USDT",
    "spread": "0.5",
    "orderAmount": "1",
    "orderRefreshTime": "10000",
    "inventoryTargetBasePct": "0.5",
    "inventorySkewEnabled": false
}
\`\`\`

Response format:

\`\`\`json
{
    "orderHash": "0x...",
    "txHash": "0x..."
}
\`\`\`
Note: you can get the marketId from the marketId of the respective trading pair in the provider and subaccountId from the subaccountId in the provider
Here are the recent user messages for context:
{{recentMessages}}
Here are the recent the providers response for context for some details that are not in the user messages:
{{providers}}
`;
