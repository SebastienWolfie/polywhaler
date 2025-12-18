export function usePolymarket() {
  const getLatestTrades = () => $fetch(`/api/polymarket/trades/latest`);
  const getAllWhales = (limit, offset) => $fetch(`/api/polymarket/whales/all?limit=${limit}&offset=${offset}`);
  const getTrade = (slug) => $fetch(`/api/polymarket/trade/${slug}`);
  const getMarket = (slug) => $fetch(`/api/polymarket/market/${slug}`);
  const getWhale = (address) => $fetch(`/api/polymarket/whale/${address}`);
  const getHistoryStats = (since) => $fetch(`/api/polymarket/history/stat?since=${since}`);

  return {
    getLatestTrades,
    getTrade,
    getMarket,
    getAllWhales,
    getHistoryStats,
    getWhale
  };
  
}