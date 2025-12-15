import getHistoryStatsFromAPI from '../api/polymarket/history/stat'
import getMarketFromAPI from '../api/polymarket/market/get'
import getTradeFromAPI from '../api/polymarket/trade/get'
import getLatestTradesFromAPI from '../api/polymarket/trades/latest'
import getWhaleFromAPI from '../api/polymarket/whale/get'
import getAllWhalesFromAPI from '../api/polymarket/whales/all'


const DEV_MODE = false;
export function usePolymarket() {
  if (DEV_MODE) { 
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
  else {
    const getLatestTrades = () => getLatestTradesFromAPI();
    const getAllWhales = (limit, offset) => getAllWhalesFromAPI({limit, offset});
    const getTrade = (slug) => getTradeFromAPI(slug);
    const getMarket = (slug) => getMarketFromAPI(slug);
    const getWhale = (address) => getWhaleFromAPI(address);
    const getHistoryStats = (since) => getHistoryStatsFromAPI(since);

    return {
      getLatestTrades,
      getTrade,
      getMarket,
      getAllWhales,
      getHistoryStats,
      getWhale
    };
  }
  
}