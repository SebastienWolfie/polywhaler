import { d as defineEventHandler, g as getQuery } from '../../../../runtime.mjs';
import 'node:http';
import 'node:https';
import 'fs';
import 'path';
import 'node:fs';
import 'node:url';

const all = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const limit = Number(query.limit || 10);
    const offset = Number(query.offset || 0);
    const trades = await $fetch(`https://www.polywhaler.com/api/trades?time=7d&category=all`, {
      headers: { accept: "application/json" }
    });
    return aggregateWhales(trades.trades).sort((a, b) => b.volume - a.volume);
  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
});
function aggregateWhales(trades) {
  const map = {};
  trades.forEach((t) => {
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
  return Object.values(map).sort((a, b) => b.volume - a.volume).map((w) => ({
    ...w,
    volume: formatMoney(w.volume),
    lastTrade: timeAgo(w.lastTrade)
  }));
}
function getRandomColor() {
  const colors = ["bg-blue-900", "bg-purple-900", "bg-teal-900", "bg-indigo-800", "bg-pink-900"];
  return colors[Math.floor(Math.random() * colors.length)];
}
function timeAgo(dateString) {
  const seconds = Math.floor((/* @__PURE__ */ new Date() - new Date(dateString * 1e3)) / 1e3);
  if (seconds < 60)
    return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
function formatMoney(amount) {
  const num = parseFloat(amount);
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(1)}M`;
  }
  if (num >= 1e5) {
    return `$${(num / 1e3).toFixed(0)}K`;
  }
  if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(1)}K`;
  }
  return `$${num.toFixed(0)}`;
}

export { all as default };
//# sourceMappingURL=all.mjs.map
