export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    // Default to 24h ago if 'since' is missing
    const since = '24h';

    // Fetch trades from Polymarket
    // We grab more data (limit=5000) to ensure smooth charts
    const trades = await $fetch(`https://www.polywhaler.com/api/trades?time=${since}&category=all`, {
      headers: { accept: 'application/json' },
    });

    // CRITICAL: Sort by timestamp (Oldest -> Newest) so the chart lines draw correctly
    // We return the raw list. We do NOT use 'new Map' because that deletes history.
    return trades.trades.sort((a, b) => a.timestamp - b.timestamp);

  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
});