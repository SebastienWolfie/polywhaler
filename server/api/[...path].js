export default defineEventHandler(async (event) => {
  const path = event.context.params?.path || ''
  const query = getQuery(event)

  try {

    if (path === 'polymarket/trades/latest') {
      const data = await getLatestTrade(query)
      return safeResponse('polymarket/trades/latest', data)
    }

    if (path === 'polymarket/whales/all') {
      const data = await getAllWhales(query)
      return safeResponse('polymarket/whales/all', data)
    }

    if (path.startsWith('polymarket/trade/')) {
      const slug = path.split('/')[2]
      const data = await getTrade(slug)
      return safeResponse('polymarket/trade', data)
    }

    if (path.startsWith('polymarket/market/')) {
      const slug = path.split('/')[2]
      const data = await getMarket(slug, query)
      return safeResponse('polymarket/market', data)
    }

    if (path.startsWith('polymarket/whale/')) {
      const address = path.split('/')[2]
      const data = await getWhale(address)
      return safeResponse('polymarket/whale', data)
    }

    if (path === 'polymarket/history/stat') {
      const since = query.since || '24h'
      const data = await getHistoryStat(since)
      return safeResponse('polymarket/history/stat', data)
    }

    if (path.startsWith('coingecko/price/')) {
      const ids = path.split('/')[2]
      const data = await getCoingeckoPrice(ids)
      return safeResponse('coingecko/price', data)
    }

    return safeResponse('fallback', {
      error: true,
      message: 'Unknown API route',
      path
    })

  } catch (err) {
    console.error('API error:', err)

    return safeResponse('handler-error', {
      error: true,
      message: err?.message || 'Internal API error'
    })
  }
})



function safeResponse(label, data) {
  try {
    // Nuxt SSR-safe deep clone
    return JSON.parse(JSON.stringify(data))
  } catch (e) {
    console.error(`❌ NON-SERIALIZABLE RESPONSE: ${label}`, e)
    return {
      error: true,
      message: `Serialization failed for ${label}`
    }
  }
}




async function getLatestTrade(query) {
  try {
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
};


async function getTrade(slug){
  try {
    const market = await $fetch(`https://gamma-api.polymarket.com/events/slug/${slug}`, {
      headers: { accept: 'application/json' },
    });

    return market;
    
  } catch (err) {
    console.error(`Failed to fetch market for ${slug}`, err);
    return {
      error:`Failed to fetch market for ${slug}`
    };
  }
};

// server/api/trades/market/[slug].js
async function getMarket(slug, query) {
  const limit = query.limit || 50;
  const offset = query.offset || 0;

  try {
    // Query data-api for trades with slug
    const res = await $fetch(`https://data-api.polymarket.com/trades?slug=${encodeURIComponent(slug)}&limit=${limit}&offset=${offset}`, {
      headers: { accept: 'application/json' }
    });

    // res is an array of trades (or { data: [...] } depending on endpoint) — normalize:
    const tradesRaw = Array.isArray(res) ? res : (res.data || []);

    // Map to shape used on the page
    const trades = tradesRaw.map(t => ({
      transactionHash: t.transactionHash || t.txid || t.tx || null,
      icon: t.icon || null,
      title: t.title || null,
      timestamp: t.timestamp,            // unix seconds
      outcome: t.outcome || t.prediction || null,
      price: typeof t.price === 'number' ? t.price : (t.prob || null),
      size: t.size || t.shares || t.amount || 0,
      side: (t.side || t.action || t.type || '').toUpperCase(),
      pseudonym: t.pseudonym || t.trader || t.maker || t.address || null,
      proxyWallet: t.proxyWallet || null,
      slug: t.slug || slug
    }));

    return { trades };
  } catch (err) {
    return { statusCode: 502, statusMessage: 'Failed to fetch trades' };
  }
};


async function getHistoryStat(since = '24h'){
  try {
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
};


async function getCoingeckoPrice(ids) {
  try {
    const prices = await $fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, {
      headers: { accept: 'application/json' },
    });

    return prices;

  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
};





async function getWhale(address) {
  try {
    // 1. Fetch trades
    const trades = await $fetch(`https://www.polywhaler.com/api/whale-profile/${address}?refresh=false`, {
      headers: { accept: 'application/json' },
    });

    return trades;

  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
};




async function getAllWhales(query) {
  try {
    const limit = Number(query.limit || 10);
    const offset = Number(query.offset || 0);

    // 1. Fetch trades
    const trades = await $fetch(`https://www.polywhaler.com/api/trades?time=7d&category=all`, {
      headers: { accept: 'application/json' },
    });

    return aggregateWhales(trades.trades).sort((a, b) => b.volume - a.volume);

  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
};

function aggregateWhales(trades) {
  const map = {};

  trades.forEach(t => {
    const addr = t.proxyWallet.toLowerCase();
    if (!map[addr]) {
      map[addr] = {
        address: addr,
        trader: t.pseudonym,
        trades: 0,
        volume: 0,
        lastTrade: t.timestamp,
        avatarColor: getRandomColor()
      };
    }
    map[addr].trades++;
    map[addr].volume += t.size * t.price;
    if (t.timestamp > map[addr].lastTrade) {
      map[addr].lastTrade = t.timestamp;
    }
  });

  return Object.values(map)
    .sort((a, b) => b.volume - a.volume)
    .map(w => ({
      ...w,
      volume: formatMoney(w.volume),
      lastTrade: timeAgo(w.lastTrade),
    }));
}

function getRandomColor() {
    const colors = ['bg-blue-900', 'bg-purple-900', 'bg-teal-900', 'bg-indigo-800', 'bg-pink-900'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function timeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString * 1000)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}

function formatMoney(amount) {
    const num = parseFloat(amount);
    
    // 1. Millions: Handles $1,000,000 and up (e.g., $1.5M)
    if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(1)}M`; 
    }
    
    // 2. Hundreds of Thousands: Handles $100,000 up to $999,999 (e.g., $150K)
    if (num >= 100000) { 
        return `$${(num / 1000).toFixed(0)}K`; 
    }
    
    // 3. Thousands: Handles $1,000 up to $99,999 (e.g., $1.5K)
    if (num >= 1000) {
        return `$${(num / 1000).toFixed(1)}K`;   
    }
    
    // 4. Default: Less than $1,000
    return `$${num.toFixed(0)}`;
}