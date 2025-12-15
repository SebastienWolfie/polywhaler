export default async function(query) {
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