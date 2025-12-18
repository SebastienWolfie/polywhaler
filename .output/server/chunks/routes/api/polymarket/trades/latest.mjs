import { d as defineEventHandler, g as getQuery } from '../../../../runtime.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';

const latest = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const search = (query.search || "").toLowerCase();
    const sideFilter = query.side || "";
    const sort = query.sort || "recent";
    const headers = {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      referer: "https://polymarket.com",
      origin: "https://polymarket.com"
    };
    let trades = await $fetch(`https://www.polywhaler.com/api/trades?time=7d&category=all`, {
      headers
    });
    trades = trades.trades.filter((t) => {
      var _a, _b;
      if (sideFilter && t.side !== sideFilter)
        return false;
      if (search && !((_a = t.title) == null ? void 0 : _a.toLowerCase().includes(search)) && !((_b = t.slug) == null ? void 0 : _b.toLowerCase().includes(search)))
        return false;
      return true;
    });
    if (sort === "amount_desc")
      trades.sort((a, b) => b.size - a.size);
    if (sort === "amount_asc")
      trades.sort((a, b) => a.size - b.size);
    const mappedTrades = await Promise.all(
      trades.map(async (trade) => {
        var _a;
        try {
          const market = await $fetch(`https://gamma-api.polymarket.com/events/slug/${trade.slug}`, {
            headers
          });
          return {
            id: market.id || trade.transaction_hash,
            icon: market.icon || trade.icon,
            title: market.title || trade.title,
            startDate: market.startDate,
            endDate: market.endDate,
            prediction: trade.outcome,
            prob: trade.price,
            tags: ((_a = market.tags) == null ? void 0 : _a.map((t) => ({ label: t.label }))) || [],
            impact: market.impact || null,
            expiry: market.endDate,
            insider: trade.insider || null,
            type: trade.side,
            amount: market.liquidity,
            shares: trade.size,
            trader: trade.pseudonym,
            avatarColor: "bg-blue-500",
            slug: trade.slug
          };
        } catch (err) {
          console.error(`Market error: ${trade.slug}`, err);
          return {
            id: trade.transaction_hash,
            icon: trade.icon,
            title: trade.title,
            startDate: trade.timestamp,
            prediction: trade.outcome,
            prob: trade.price,
            tags: [],
            impact: null,
            insider: null,
            type: trade.side,
            amount: trade.size,
            shares: trade.size,
            trader: trade.pseudonym,
            avatarColor: "bg-blue-500",
            slug: trade.slug
          };
        }
      })
    );
    return mappedTrades;
  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
});

export { latest as default };
//# sourceMappingURL=latest.mjs.map
