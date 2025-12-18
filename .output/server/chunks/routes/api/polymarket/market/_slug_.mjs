import { d as defineEventHandler, g as getQuery, c as createError } from '../../../../runtime.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';

const _slug_ = defineEventHandler(async (event) => {
  const { slug } = event.context.params;
  const query = getQuery(event);
  const limit = query.limit || 50;
  const offset = query.offset || 0;
  try {
    const res = await $fetch(`https://data-api.polymarket.com/trades?slug=${encodeURIComponent(slug)}&limit=${limit}&offset=${offset}`, {
      headers: { accept: "application/json" }
    });
    const tradesRaw = Array.isArray(res) ? res : res.data || [];
    const trades = tradesRaw.map((t) => ({
      transactionHash: t.transactionHash || t.txid || t.tx || null,
      icon: t.icon || null,
      title: t.title || null,
      timestamp: t.timestamp,
      // unix seconds
      outcome: t.outcome || t.prediction || null,
      price: typeof t.price === "number" ? t.price : t.prob || null,
      size: t.size || t.shares || t.amount || 0,
      side: (t.side || t.action || t.type || "").toUpperCase(),
      pseudonym: t.pseudonym || t.trader || t.maker || t.address || null,
      proxyWallet: t.proxyWallet || null,
      slug: t.slug || slug,
      raw: t
    }));
    return { trades };
  } catch (err) {
    console.error("Failed to fetch trades for market", slug, err);
    return createError({ statusCode: 502, statusMessage: "Failed to fetch trades" });
  }
});

export { _slug_ as default };
//# sourceMappingURL=_slug_.mjs.map
