import { d as defineEventHandler } from '../../../../runtime.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';

const _ids_ = defineEventHandler(async (event) => {
  try {
    const { ids } = event.context.params;
    const prices = await $fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, {
      headers: { accept: "application/json" }
    });
    return prices;
  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
});

export { _ids_ as default };
//# sourceMappingURL=_ids_.mjs.map
