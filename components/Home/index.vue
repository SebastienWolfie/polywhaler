<template>
  <div class="min-h-screen bg-black text-gray-200 font-sans pb-20">

    <div class="text-center py-10 px-4">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
        Polymarket Whale Tracker
      </h1>
      <p class="text-gray-400 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
        Track Polymarket whales and large bets in real-time. Monitor $10k+ trades, analyze market sentiment, and detect insider trading activity with AI-powered predictions.
      </p>

      <div class="flex justify-center gap-8 text-sm font-bold text-white">
        <div class="flex flex-col items-center">
          <span class="text-lg">Real-Time</span>
          <span class="text-gray-500 text-xs font-normal">Live whale trade monitoring</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-lg">$10k+ Trades</span>
          <span class="text-gray-500 text-xs font-normal">Track large bets instantly</span>
        </div>
        <div class="flex flex-col items-center">
          <span class="text-lg">AI Analysis</span>
          <span class="text-gray-500 text-xs font-normal">Insider detection & predictions</span>
        </div>
      </div>
    </div>

    
    <div class="max-w-7xl mx-auto px-4">
      <div v-if="loading" class="py-20 flex flex-col items-center gap-4">
        <div class="w-10 h-10 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p class="text-gray-400 text-sm">Loading whale activity…</p>
      </div>
      <!-- Stats cards -->
      <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="card-bg rounded-xl p-5 flex items-center justify-between">
          <div>
            <div class="text-gray-500 text-xs font-medium mb-1">Total Volume</div>
            <div class="text-xl font-bold text-white">{{ stats.totalVolume }}</div>
          </div>
          <div class="text-blue-500 text-xl font-bold">$</div>
        </div>

        <div class="card-bg rounded-xl p-5 flex items-center justify-between">
          <div>
            <div class="text-gray-500 text-xs font-medium mb-1">Buy Orders</div>
            <div class="text-xl font-bold text-white">{{ stats.buyOrders }}</div>
          </div>
          <div class="text-green-500 text-xl font-bold">↗</div>
        </div>

        <div class="card-bg rounded-xl p-5 flex items-center justify-between">
          <div>
            <div class="text-gray-500 text-xs font-medium mb-1">Sell Orders</div>
            <div class="text-xl font-bold text-white">{{ stats.sellOrders }}</div>
          </div>
          <div class="text-red-500 text-xl font-bold">↘</div>
        </div>

        <div class="card-bg rounded-xl p-5 flex items-center justify-between">
          <div>
            <div class="text-gray-500 text-xs font-medium mb-1">Avg Trade Size</div>
            <div class="text-xl font-bold text-white">{{ stats.avgTradeSize }}</div>
          </div>
          <div class="text-blue-400 text-xl font-bold">⚡</div>
        </div>
      </div>

      <!-- Sentiment panel -->
      <div v-if="!loading" class="card-bg rounded-xl p-6 mb-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-white font-bold text-base mb-1">Market Sentiment</h2>
            <p class="text-gray-500 text-xs">Automatic sentiment score from whale activity • Updated {{ lastUpdated }}</p>
          </div>
          <div class="text-right">
            <div :class="sentimentBadgeClass" class="px-3 py-1 rounded-full text-xs font-bold">
              {{ sentimentCategory }}
            </div>
            <div class="text-gray-400 text-xs mt-1">Score: <span class="font-bold">{{ sentimentScore.toFixed(2) }}</span></div>
          </div>
        </div>

        <div v-if="!loading" class="mb-6">
          <div class="flex justify-between items-end mb-2">
            <span class="text-gray-400 text-xs">Sentiment Score</span>
            <span :class="sentimentScoreColor" class="font-bold text-xl">{{ sentimentScoreDisplay }}</span>
          </div>

          <div class="relative h-2 w-full rounded-full bg-white/10 mb-2">
            <div class="absolute top-0 left-0 w-full h-full rounded-full sentiment-bar opacity-80"></div>
            <!-- marker position: left 0..100% -->
            <div
              :style="{ left: sentimentPosition + '%' }"
              class="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-black rounded-full shadow-lg transform -translate-x-1/2"
            ></div>
          </div>

          <div class="flex justify-between text-[10px] text-gray-500">
            <span>Bearish</span>
            <span>Neutral</span>
            <span>Bullish</span>
          </div>
        </div>

        <div v-if="!loading" class="flex items-center justify-between text-xs mb-8">
          <span class="text-gray-400">Whale-Market Alignment</span>
          <span class="text-yellow-500 font-bold">{{ whaleAlignment }}</span>
        </div>

        <div v-if="!loading" class="border-t border-white/10 pt-4">
          <h3 class="text-xs text-gray-400 mb-3">Sentiment Factors</h3>
          <div class="grid grid-cols-2 gap-x-12 gap-y-4">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400">Event Context</span>
              <span :class="factorClass(factors.eventContext)">{{ factorSign(factors.eventContext) }}{{ Math.abs(factors.eventContext) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400">Trade Timing</span>
              <span :class="factorClass(factors.tradeTiming)">{{ factorSign(factors.tradeTiming) }}{{ Math.abs(factors.tradeTiming) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400">Probability Impact</span>
              <span :class="factorClass(factors.probImpact)">{{ factorSign(factors.probImpact) }}{{ Math.abs(factors.probImpact) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-400">Volume Weight</span>
              <span :class="factorClass(factors.volumeWeight)">{{ factorSign(factors.volumeWeight) }}{{ Math.abs(factors.volumeWeight) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Buy / Sell breakdown -->
      <div v-if="!loading" class="card-bg rounded-xl p-6 mb-6">
        <p class="text-gray-400 text-xs mb-4">Whales are defined as trades >= $10,000.</p>

        <div class="flex justify-between text-xs font-bold mb-2">
          <span class="text-green-500">Buy: {{ whalePercBuy.toFixed(1) }}%</span>
          <span class="text-red-500">Sell: {{ whalePercSell.toFixed(1) }}%</span>
        </div>

        <div class="h-3 w-full rounded-full flex overflow-hidden mb-4">
          <div class="h-full bg-green-600" :style="{ width: whalePercBuy + '%' }"></div>
          <div class="h-full bg-red-600" :style="{ width: whalePercSell + '%' }"></div>
        </div>

        <div class="flex justify-between">
          <div>
            <div class="text-gray-500 text-[10px] mb-1">Buy Volume (whales)</div>
            <div class="text-green-500 font-bold text-lg">{{ formatUSD(whaleBuyVolume) }}</div>
          </div>
          <div class="text-right">
            <div class="text-gray-500 text-[10px] mb-1">Sell Volume (whales)</div>
            <div class="text-red-500 font-bold text-lg">{{ formatUSD(whaleSellVolume) }}</div>
          </div>
        </div>
      </div>

      <!-- Advanced Impact (simple counts) -->
      <div v-if="!loading" class="card-bg rounded-xl p-6 mb-8">
        <h3 class="font-bold text-white mb-4 text-sm">Advanced Impact Analysis</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-black border border-white/10 rounded-lg p-4">
            <div class="text-gray-300 font-bold text-xs mb-1">High Impact Trades</div>
            <div class="text-2xl font-bold text-white">{{ impactCounts.high }}</div>
          </div>
          <div class="bg-black border border-white/10 rounded-lg p-4">
            <div class="text-gray-300 font-bold text-xs mb-1">Medium Impact Trades</div>
            <div class="text-2xl font-bold text-white">{{ impactCounts.medium }}</div>
          </div>
          <div class="bg-black border border-white/10 rounded-lg p-4">
            <div class="text-gray-300 font-bold text-xs mb-1">Low Impact Trades</div>
            <div class="text-2xl font-bold text-white">{{ impactCounts.low }}</div>
          </div>
        </div>
      </div>

      <!-- Controls: Search / Filter / Sort -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <div class="flex items-center gap-3 w-full md:w-auto">
          <div class="relative w-full max-w-xs">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input v-model="searchQuery" :disabled="loading" type="text" placeholder="Search trades..."
                   class="bg-black border border-white/10 text-gray-300 text-xs rounded-lg block w-full pl-10 p-2" />
          </div>

          <div class="flex gap-2">
            <button @click="setFilter('buy')" :disabled="loading" :class="filterSide === 'buy' ? activeFilterClass : inactiveFilterClass" class="text-xs px-3 py-1.5 rounded-lg">BUY</button>
            <button @click="setFilter('sell')" :disabled="loading" :class="filterSide === 'sell' ? activeFilterClass : inactiveFilterClass" class="text-xs px-3 py-1.5 rounded-lg">SELL</button>
            <button @click="setFilter('all')" :disabled="loading" :class="filterSide === 'all' ? activeFilterClass : inactiveFilterClass" class="text-xs px-3 py-1.5 rounded-lg">ALL</button>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs text-gray-400">
          <span>Sort by:</span>
          <select v-model="sortBy" class="bg-black border border-white/10 rounded px-2 py-1 text-white text-xs">
            <option value="recent">Most Recent</option>
            <option value="amount_desc">Biggest Trades</option>
            <option value="amount_asc">Smallest Trades</option>
          </select>
        </div>
      </div>

      <!-- Trades list -->
      <div>
        <!-- Loading skeletons -->
        <template v-if="loading">
          <div
            v-for="i in pageSize"
            :key="i"
            class="card-bg rounded-lg p-4 mb-3 animate-pulse"
          >
            <div class="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
            <div class="h-3 bg-white/10 rounded w-1/4 mb-1"></div>
            <div class="h-3 bg-white/10 rounded w-1/5"></div>
          </div>
        </template>

        <!-- Loaded trades -->
        <template v-else>
          <HomeTradeItem
            v-for="(trade, index) in paginatedTrades"
            :key="index"
            :trade="trade"
          />
        </template>
      </div>

      <div
        v-if="loadError && !loading"
        class="text-center py-10 text-red-400 text-sm"
      >
        {{ loadError }}
      </div>



      <!-- Pagination -->
      <div class="mt-6">
        <Pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total-items="filteredCount"
          @pageChange="onPageChange"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const TRADES_PER_PAGE_DEFAULT = 20;
const WHALE_THRESHOLD_USD = 10000; // >= $10k

// reactive state
const trades = ref([]);            // raw trade array from API
const searchQuery = ref('');
const filterSide = ref('all');     // 'all' | 'buy' | 'sell'
const sortBy = ref('recent');      // recent | amount_desc | amount_asc
const currentPage = ref(1);
const pageSize = ref(TRADES_PER_PAGE_DEFAULT);
const lastUpdated = ref('--:--:--');
const loading = ref(true);
const loadError = ref(null);


// UI classes
const activeFilterClass = 'bg-blue-600 text-white';
const inactiveFilterClass = 'border border-white/10 text-gray-400';

// small wrapper to call API either via composable or direct call
async function loadLatestTrades() {
  if (typeof usePolymarket !== 'undefined') {
    try {
      // If composable exists and exposes getLatestTrades
      const { getLatestTrades } = usePolymarket();
      if (getLatestTrades) {
        return await getLatestTrades();
        // return await useAsyncData(`trades`, () => getLatestTrades(), {
        //   transform: (data) => JSON.parse(JSON.stringify(data))
        // })
      }
    } catch (e) {
      // ignore — fallback to direct API
    }
  }

  // fallback: direct fetch to your server route (expects /api/trades)
  // return await $fetch('/api/trades');
}

// load on mount
onMounted(async () => {
  loading.value = true;
  loadError.value = null;
   try {
    const raw = await loadLatestTrades(1000, 0);
    trades.value = Array.isArray(raw)
      ? raw
      : (raw.trades || raw.data || []);
    lastUpdated.value = new window.Date().toLocaleTimeString();
    console.log(raw)
  } catch (err) {
    console.error(err);
    loadError.value = 'Failed to load trades';
  } finally {
    loading.value = false;
  }
});

// --- computed: filtered / sorted list ---
const filteredTrades = computed(() => {
  let t = trades.value.slice();

  // make ids unique
  // t = Array.from(
  //   new Map(t.map(trade => [trade.slug, trade])).values()
  // );
  // search
  const q = (searchQuery.value || '').trim().toLowerCase();
  if (q) {
    t = t.filter(tr => {
      const title = (tr.title || tr.name || '').toString().toLowerCase();
      const trader = (tr.pseudonym || tr.trader || '').toString().toLowerCase();
      return title.includes(q) || trader.includes(q) || (tr.slug || '').toLowerCase().includes(q);
    });
  }

  // filter by side
  if (filterSide.value === 'buy') t = t.filter(tr => (tr.side || tr.type || '').toString().toUpperCase() === 'BUY' || (tr.type || '').toString().toLowerCase() === 'buy' );
  if (filterSide.value === 'sell') t = t.filter(tr => (tr.side || tr.type || '').toString().toUpperCase() === 'SELL' || (tr.type || '').toString().toLowerCase() === 'sell' );

  // sort
  if (sortBy.value === 'recent') {
    t.sort((a,b) => ( (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0) ));
  } else if (sortBy.value === 'amount_desc') {
    t.sort((a,b) => ( (b.size || b.amount || b.shares || 0) - (a.size || a.amount || a.shares || 0) ));
  } else if (sortBy.value === 'amount_asc') {
    t.sort((a,b) => ( (a.size || a.amount || a.shares || 0) - (b.size || b.amount || b.shares || 0) ));
  }

  return t;
});

// pagination slice
const paginatedTrades = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTrades.value.slice(start, end);
});

const filteredCount = computed(() => filteredTrades.value.length);

// change page
function onPageChange(page) {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// set filter helper
function setFilter(f) {
  filterSide.value = f;
  currentPage.value = 1;
}

// last: compute metrics

// helper to compute USD value of a trade: size * price (price may be probability 0..1),
// if API returns amount as USD, prefer amount. We'll compute heuristically.
function tradeUSDValue(tr) {
  if (!tr) return 0;
  // common fields: size (shares), price (0..1) -> USD = size * price
  const size = Number(tr.size || tr.amount || tr.shares || 0);
  const price = Number(tr.price || tr.prob || tr.probability || 0);
  // if price appears > 1 (maybe already USD), fallback to amount
  if (price > 1) {
    // price is likely in USD per share -> size * price
    return size * price;
  }
  // if we have a field like USD total on trade, use it:
  if (tr.usdValue || tr.valueUSD) return Number(tr.usdValue || tr.valueUSD);
  return size * price;
}

// basic stats
const stats = computed(() => {
  const list = filteredTrades.value;
  const totalVolumeNum = list.reduce((s, t) => s + tradeUSDValue(t), 0);
  const buys = list.filter(t => ((t.side || t.type || '').toString().toUpperCase() === 'BUY')).length;
  const sells = list.filter(t => ((t.side || t.type || '').toString().toUpperCase() === 'SELL')).length;
  const avg = list.length ? (totalVolumeNum / list.length) : 0;

  return {
    totalVolume: formatUSD(totalVolumeNum),
    buyOrders: buys,
    sellOrders: sells,
    avgTradeSize: formatUSD(avg)
  };
});

// whale metrics
const whaleTrades = computed(() => {
  // trades with value >= threshold
  const list = filteredTrades.value;
  return list.filter(t => tradeUSDValue(t) >= WHALE_THRESHOLD_USD);
});
const whaleBuyTrades = computed(() => whaleTrades.value.filter(t => ((t.side || t.type || '').toString().toUpperCase() === 'BUY')));
const whaleSellTrades = computed(() => whaleTrades.value.filter(t => ((t.side || t.type || '').toString().toUpperCase() === 'SELL')));
const whaleBuyCount = computed(() => whaleBuyTrades.value.length);
const whaleSellCount = computed(() => whaleSellTrades.value.length);
const whaleBuyVolume = computed(() => whaleBuyTrades.value.reduce((s,t) => s + tradeUSDValue(t), 0));
const whaleSellVolume = computed(() => whaleSellTrades.value.reduce((s,t) => s + tradeUSDValue(t), 0));
const whaleTotalVolume = computed(() => whaleBuyVolume.value + whaleSellVolume.value);

const whalePercBuy = computed(() => whaleTotalVolume.value ? (whaleBuyVolume.value / whaleTotalVolume.value * 100) : 0);
const whalePercSell = computed(() => whaleTotalVolume.value ? (whaleSellVolume.value / whaleTotalVolume.value * 100) : 0);

// impact counts (simple heuristic based on size vs global liquidity if available)
const impactCounts = computed(() => {
  let high = 0, medium = 0, low = 0;
  for (const t of filteredTrades.value) {
    // heuristic: compare tradeUSDValue to average trade size or to some liquidity-like field if present
    const val = tradeUSDValue(t);
    const avg = Number(stats.value.avgTradeSize.replace(/[^0-9.-]+/g,"")) || 1;
    if (val >= 5 * avg) high++;
    else if (val >= 2 * avg) medium++;
    else low++;
  }
  return { high, medium, low };
});

// Sentiment simple scoring (Option A - automatic)
// Score components are in range approx [-5..+5] each, combined then clipped to [-10, +10]
const factors = computed(() => {
  // Factor A: buy vs sell ratio (whales)
  const buyVol = whaleBuyVolume.value;
  const sellVol = whaleSellVolume.value;
  const total = buyVol + sellVol || 1;
  const buyRatio = buyVol / total; // 0..1
  const buySellFactor = (buyRatio - 0.5) * 10; // -5 .. +5

  // Factor B: volume impact (magnitude relative to total trade volume)
  const globalVolume = filteredTrades.value.reduce((s,t) => s + tradeUSDValue(t), 0) || 1;
  const volumeImpact = ((buyVol - sellVol) / globalVolume) * 10; // approx -10..+10

  // Factor C: price movement impact (avg price deviation from 0.5)
  const avgPrice = filteredTrades.value.reduce((s,t) => s + Number(t.price || t.prob || 0), 0) / (filteredTrades.value.length || 1);
  const priceImpact = (avgPrice - 0.5) * 10; // -5..+5

  // Factor D: market outcome push (if we can infer)
  // Try to get market-level probability from some trades: average prediction per market if available
  // We'll approximate with global avgPrice: if avgPrice > 0.55 give slight bullish, <0.45 slight bearish
  let outcomePush = 0;
  if (avgPrice > 0.55) outcomePush = 1.0;
  if (avgPrice < 0.45) outcomePush = -1.0;

  // Breakdown factors to display (small integers)
  return {
    eventContext: Math.round(outcomePush),
    tradeTiming: Math.round(priceImpact),      // ±5
    probImpact: Math.round((avgPrice - 0.5) * 10),
    volumeWeight: Math.round(volumeImpact),
    buySellFactor,
    volumeImpact,
    priceImpact,
    outcomePush
  };
});

// Total sentiment score
const sentimentScore = computed(() => {
  const f = factors.value;
  // weight factors:
  // buySellFactor (30%), volumeImpact (30%), priceImpact (30%), outcomePush (10%)
  const raw = (f.buySellFactor * 0.3) + (f.volumeImpact * 0.3) + (f.priceImpact * 0.3) + (f.outcomePush * 0.1);
  // clamp to [-10, 10]
  return Math.max(-10, Math.min(10, raw));
});

const sentimentCategory = computed(() => {
  const s = sentimentScore.value;
  if (s >= 3) return 'Bullish';
  if (s <= -3) return 'Bearish';
  return 'Neutral';
});
const sentimentBadgeClass = computed(() => {
  if (sentimentCategory.value === 'Bullish') return 'bg-green-500/20 text-green-400';
  if (sentimentCategory.value === 'Bearish') return 'bg-red-500/20 text-red-400';
  return 'bg-yellow-500/20 text-yellow-400';
});
const sentimentScoreColor = computed(() => {
  const s = sentimentScore.value;
  if (s >= 3) return 'text-green-500';
  if (s <= -3) return 'text-red-500';
  return 'text-yellow-500';
});
const sentimentScoreDisplay = computed(() => sentimentScore.value.toFixed(2));

// marker position on 0..100% where -10 => 0%, 0 => 50%, +10 => 100%
const sentimentPosition = computed(() => {
  const s = sentimentScore.value;
  return ((s + 10) / 20) * 100;
});

// whale alignment
const whaleAlignment = computed(() => {
  // If whale buy % > 60 and overall avg price > 0.52 -> aligned bullish
  const avgPrice = filteredTrades.value.reduce((s,t) => s + Number(t.price || 0), 0) / (filteredTrades.value.length || 1);
  if (whalePercBuy.value > 60 && avgPrice > 0.52) return 'Bullish (aligned)';
  if (whalePercSell.value > 60 && avgPrice < 0.48) return 'Bearish (aligned)';
  return 'Neutral';
});

// helper displays
function formatUSD(v) {
  if (!v && v !== 0) return '—';
  return `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function factorClass(val) {
  if (val > 0) return 'text-green-500 font-bold';
  if (val < 0) return 'text-red-500 font-bold';
  return 'text-gray-400 font-bold';
}
function factorSign(val) {
  if (val > 0) return '+';
  if (val < 0) return '-';
  return '';
}


</script>