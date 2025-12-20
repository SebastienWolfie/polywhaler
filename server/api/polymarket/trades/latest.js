export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    const search = (query.search || "").toLowerCase();
    const sideFilter = query.side || "";     // BUY / SELL
    const sort = query.sort || "recent";     // recent, amount_desc, amount_asc

    const headers = {
      accept: 'application/json',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      referer: 'https://polymarket.com',
      origin: 'https://polymarket.com'
    }

    // 1. Fetch trades
    let trades = await $fetch(`https://www.polywhaler.com/api/trades?time=7d&category=all`, {
      headers
    });

    // 2. Apply filters BEFORE expensive API calls
    trades = trades.trades.filter(t => {
      if (sideFilter && t.side !== sideFilter) return false;
      if (search && !t.title?.toLowerCase().includes(search) && !t.slug?.toLowerCase().includes(search)) return false;
      return true;
    });

    // 3. Sorting options
    if (sort === "amount_desc") trades.sort((a, b) => b.size - a.size)
    if (sort === "amount_asc") trades.sort((a, b) => a.size - b.size)

    // 4. Map each trade with market info
    const mappedTrades = await Promise.all(
      trades.map(async (trade) => {
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
            tags: market.tags?.map(t => ({ label: t.label })) || [],
            impact: market.impact || null,
            expiry: market.endDate,
            insider: trade.insider || null,
            type: trade.side,
            amount: market.liquidity,
            shares: trade.size,
            trader: trade.pseudonym,
            avatarColor: 'bg-blue-500',
            slug: trade.slug,
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
            avatarColor: 'bg-blue-500',
            slug: trade.slug,
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