export default defineEventHandler(async (event) => {
  try {
    const { address } = event.context.params;

    // 1. Fetch trades
    const trades = await $fetch(`https://www.polywhaler.com/api/whale-profile/${address}?refresh=false`, {
      headers: { accept: 'application/json' },
    });

    return trades;

  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
});