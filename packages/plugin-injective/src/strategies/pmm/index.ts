// // === CONFIGURATION ===

// const pmmParams = {
//     spread: 0.002, // 0.2%
//     orderAmount: 1, // 1 INJ
//     orderRefreshTime: 10000, // 10s
//     inventoryTargetBasePct: 0.5,
//     inventorySkewEnabled: true,
// };

// // === PURE MARKET MAKER ===
// class InjectivePMM {
//     private balances: { baseAsset: number; quoteAsset: number } = {
//         baseAsset: 0,
//         quoteAsset: 0,
//     };

//     async start() {
//         while (true) {
//             try {
//                 await this.updateBalances();

//                 const midPrice = await this.getMidPrice();
//                 const skewAdjustment = this.getInventorySkew(midPrice);

//                 const bidPrice =
//                     midPrice * (1 - pmmParams.spread / 2 + skewAdjustment);
//                 const askPrice =
//                     midPrice * (1 + pmmParams.spread / 2 + skewAdjustment);

//                 console.log(
//                     `Mid: ${midPrice}, Bid: ${bidPrice.toFixed(4)}, Ask: ${askPrice.toFixed(4)}`,
//                 );

//                 await this.cancelAllOrders();
//                 await this.placeOrder("buy", bidPrice, pmmParams.orderAmount);
//                 await this.placeOrder("sell", askPrice, pmmParams.orderAmount);
//             } catch (err) {
//                 console.error("Error:", err);
//             }

//             await this.sleep(pmmParams.orderRefreshTime);
//         }
//     }

//     private async getMidPrice(): Promise<number> {
//         const { markets } = await indexerSpotApi.fetchMarkets();
//         const market = markets.find((m) => m.marketId === MARKET_ID);
//         if (!market) throw new Error("Market not found");

//         const bestBid = parseFloat(market.bestBidPrice);
//         const bestAsk = parseFloat(market.bestAskPrice);

//         const midPrice = (bestBid + bestAsk) / 2;
//         return midPrice;
//     }

//     private async updateBalances() {
//         const { balancesList } = await indexerSpotApi.fetchAccountPortfolio({
//             subaccountId: SUBACCOUNT_ID,
//         });

//         const baseBalanceRaw =
//             balancesList.find((b) => b.denom === "inj")?.totalBalance || "0";
//         const quoteBalanceRaw =
//             balancesList.find((b) => b.denom === "usdt")?.totalBalance || "0";

//         this.balances.baseAsset = new BigNumberInBase(baseBalanceRaw)
//             .shiftedBy(-BASE_DECIMALS)
//             .toNumber();
//         this.balances.quoteAsset = new BigNumberInBase(quoteBalanceRaw)
//             .shiftedBy(-QUOTE_DECIMALS)
//             .toNumber();

//         console.log(
//             `Balances - Base: ${this.balances.baseAsset}, Quote: ${this.balances.quoteAsset}`,
//         );
//     }

//     private getInventoryRatio(midPrice: number): number {
//         const baseValue = this.balances.baseAsset * midPrice;
//         const totalValue = baseValue + this.balances.quoteAsset;
//         return totalValue === 0 ? 0 : baseValue / totalValue;
//     }

//     private getInventorySkew(midPrice: number): number {
//         if (!pmmParams.inventorySkewEnabled) return 0;

//         const inventoryRatio = this.getInventoryRatio(midPrice);
//         const imbalance = inventoryRatio - pmmParams.inventoryTargetBasePct;

//         console.log(
//             `[Inventory Skew] Ratio: ${(inventoryRatio * 100).toFixed(2)}%, Imbalance: ${(imbalance * 100).toFixed(2)}%`,
//         );

//         const skewFactor = 0.5;
//         return -imbalance * skewFactor * pmmParams.spread;
//     }

//     private async placeOrder(
//         side: "buy" | "sell",
//         price: number,
//         quantity: number,
//     ) {
//         const orderSide =
//             side === "buy" ? SpotOrderSide.Buy : SpotOrderSide.Sell;
//         const orderPrice = new BigNumberInBase(price).toFixed(6);
//         const orderQuantity = new BigNumberInBase(quantity).toFixed(6);

//         const order = SpotExchangeApi.composeSpotOrder({
//             marketId: MARKET_ID,
//             subaccountId: SUBACCOUNT_ID,
//             injectiveAddress,
//             price: orderPrice,
//             quantity: orderQuantity,
//             orderType: SpotOrderType.Limit,
//             feeRecipient: injectiveAddress,
//             side: orderSide,
//         });

//         console.log(
//             `[Order Placed] ${side.toUpperCase()} ${quantity} @ ${price}`,
//         );

//         await broadcaster.broadcast({
//             msgs: order,
//         });
//     }

//     private async cancelAllOrders() {
//         const { orders } = await indexerSpotApi.fetchOrders({
//             subaccountId: SUBACCOUNT_ID,
//             marketId: MARKET_ID,
//         });

//         if (orders.length === 0) return;

//         const orderCancellations = orders.map((order) => {
//             return SpotExchangeApi.composeCancelSpotOrder({
//                 injectiveAddress,
//                 marketId: MARKET_ID,
//                 subaccountId: SUBACCOUNT_ID,
//                 orderHash: order.orderHash,
//             });
//         });

//         console.log(`[Orders] Cancelling ${orders.length} orders`);

//         await broadcaster.broadcast({
//             msgs: orderCancellations,
//         });
//     }

//     private async sleep(ms: number) {
//         return new Promise((resolve) => setTimeout(resolve, ms));
//     }
// }

// (async () => {
//     const pmmBot = new InjectivePMM();
//     await pmmBot.start();
// })();
