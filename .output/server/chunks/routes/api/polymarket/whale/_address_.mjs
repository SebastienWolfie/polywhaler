import { d as defineEventHandler } from '../../../../runtime.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';

const _address_ = defineEventHandler(async (event) => {
  try {
    const { address } = event.context.params;
    const trades = await $fetch(`https://www.polywhaler.com/api/whale-profile/${address}?refresh=false`, {
      headers: { accept: "application/json" }
    });
    return trades;
  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
});

export { _address_ as default };
//# sourceMappingURL=_address_.mjs.map
