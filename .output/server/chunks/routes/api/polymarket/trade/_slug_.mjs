import { d as defineEventHandler } from '../../../../runtime.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';

const _slug_ = defineEventHandler(async (event) => {
  const { slug } = event.context.params;
  try {
    const market = await $fetch(`https://gamma-api.polymarket.com/events/slug/${slug}`, {
      headers: { accept: "application/json" }
    });
    return market;
  } catch (err) {
    console.error(`Failed to fetch market for ${slug}`, err);
    return {
      error: `Failed to fetch market for ${slug}`,
      err
    };
  }
});

export { _slug_ as default };
//# sourceMappingURL=_slug_.mjs.map
