import { d as defineEventHandler, g as getQuery } from '../../../../runtime.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';

const stat = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const since = "24h";
    const trades = await $fetch(`https://www.polywhaler.com/api/trades?time=${since}&category=all`, {
      headers: { accept: "application/json" }
    });
    return trades.trades.sort((a, b) => a.timestamp - b.timestamp);
  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
});

export { stat as default };
//# sourceMappingURL=stat.mjs.map
