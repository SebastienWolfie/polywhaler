<template>
  <div class="min-h-screen bg-black text-gray-300 font-sans selection:bg-blue-500/30">
    <main class="max-w-5xl mx-auto px-6 py-8">
      <!-- Back -->
      <button @click="goBack" class="flex items-center gap-2 text-gray-500 hover:text-white mb-6 text-sm transition-colors">
        <ArrowLeft :size="16" /> Back to Dashboard
      </button>

      <!-- Loading / Error -->
      <div v-if="loading" class="text-gray-500">Loading market...</div>
      <div v-else-if="error" class="text-red-500">{{ error }}</div>

      <div v-else>
        <!-- Title -->
        <div class="flex items-start gap-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 overflow-hidden">
            <img v-if="market.icon" :src="market.icon" alt="icon" class="w-full h-full object-cover"/>
            <span v-else class="text-black font-bold text-xl">M</span>
          </div>

          <div class="flex-1">
            <h1 class="text-3xl font-bold text-white mb-1">{{ market.title }}</h1>
            <p class="text-gray-500">{{ market.description }}</p>

            <div class="mt-2 flex items-center gap-3 text-sm text-gray-400">
              <div>Ends: <span class="text-white">{{ formatDate(market.endDate) }}</span></div>
              <div>Liquidity: <span class="text-white font-mono">{{ formatNumber(market.liquidity) }}</span></div>
              <div>Volume (24h): <span class="text-white font-mono">{{ formatNumber(market.volume24hr ?? market.volume) }}</span></div>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <span v-for="tag in market.tags || []" :key="tag.slug || tag.label" class="text-[11px] bg-[#1e1b4b] px-2 py-1 rounded border border-indigo-900 text-indigo-300">
                {{ tag.label || tag }}
              </span>
            </div>
          </div>
        </div>

        <!-- Top panels (Profitable exit / Direction) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Left: Example profitable exit — show latest big trade if exists -->
          <div class="bg-[#051109] border border-green-900/30 rounded-xl p-6">
            <div class="flex items-center gap-2 mb-2 text-green-400">
              <DollarSign :size="20" />
              <h3 class="font-bold">Profitable Exit</h3>
            </div>

            <div v-if="bigTrade">
              <p class="text-gray-400 text-sm mb-4">
                This trader is {{ bigTrade.side.toLowerCase() }} <span class="text-gray-300">{{ bigTrade.size }} shares</span> at <span class="text-gray-300">{{ formatPrice(bigTrade.price) }}</span>.
              </p>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-gray-500 text-xs uppercase font-bold mb-1">Price</p>
                  <p class="text-2xl font-bold text-white font-mono">{{ formatPrice(bigTrade.price) }}</p>
                </div>
                <div>
                  <p class="text-gray-500 text-xs uppercase font-bold mb-1">Trade Size</p>
                  <p class="text-2xl font-bold text-white font-mono">{{ bigTrade.size }}</p>
                </div>
              </div>
            </div>

            <div v-else class="text-gray-400">No large trades yet.</div>
          </div>

          <!-- Right: Market direction -->
          <div class="bg-[#080c14] border border-blue-900/30 rounded-xl p-6">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="bg-blue-600 rounded p-1"><Activity :size="16" class="text-white" /></div>
                <h3 class="font-bold text-white">Market Direction Signal</h3>
              </div>

              <div class="flex gap-2 items-center text-xs">
                <span :class="impactBadgeClass" class="px-2 py-1 rounded font-bold">{{ impactLabel }}</span>
                <span class="text-gray-500 text-xs">Impact Score: {{ impactScore }}</span>
              </div>
            </div>

            <h4 class="text-white font-semibold mb-2">{{ directionHeadline }}</h4>
            <p class="text-gray-400 text-sm mb-2">{{ directionBlurb }}</p>

            <div class="bg-[#0f1623] border border-blue-900/20 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-2 text-blue-400"><Sparkles :size="16" /><span class="font-bold text-sm">AI Market Context</span></div>
              <p class="text-blue-200/70 text-sm leading-relaxed">
                {{ aiContext }}
              </p>
            </div>
          </div>
        </div>

        <!-- Insights -->
        <div class="bg-[#080c14] border border-blue-900/20 rounded-xl p-6 mb-8 shadow-sm">
          <div class="flex items-center gap-2 mb-4 text-blue-500"><Target :size="18" /><h3 class="font-bold text-sm uppercase tracking-wide">Key Market Insights</h3></div>
          <ul class="space-y-3">
            <li v-for="(item,i) in insights" :key="i" class="flex gap-3 text-gray-400 text-sm">
              <div class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>{{ item }}
            </li>
          </ul>
        </div>

        <!-- Trade Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Direction -->
          <div class="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4 text-gray-400"><TrendingDown :size="18" class="text-red-500" /><span class="font-bold text-sm text-white">Trade Direction</span></div>
            <div class="space-y-3">
              <div class="flex justify-between items-center border-b border-gray-800 pb-3">
                <span class="text-gray-500 text-sm">Side</span>
                <span class="bg-zinc-800 text-gray-300 px-2 py-0.5 rounded text-xs font-bold">{{ bigTrade?.side || '—' }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm">Outcome</span>
                <span class="bg-zinc-800 text-white px-2 py-0.5 rounded text-xs font-bold">{{ bigTrade?.outcome || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Trade Value -->
          <div class="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4 text-gray-400"><DollarSign :size="18" class="text-blue-500" /><span class="font-bold text-sm text-white">Trade Value</span></div>
            <div class="space-y-3">
              <div class="flex justify-between items-center border-b border-gray-800 pb-3">
                <span class="text-gray-500 text-sm">Total Value</span>
                <span class="text-white font-bold font-mono text-lg">{{ formatUSD(bigTradeValue) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm">Position Size</span>
                <span class="text-white font-mono text-sm">{{ bigTrade?.size || '—' }} shares</span>
              </div>
            </div>
          </div>

          <!-- Bet Price -->
          <div class="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4 text-gray-400"><Target :size="18" class="text-emerald-500" /><span class="font-bold text-sm text-white">Bet Price</span></div>
            <div class="space-y-3">
              <div class="flex justify-between items-center border-b border-gray-800 pb-3">
                <span class="text-gray-500 text-sm">Price per Share</span>
                <span class="text-white font-bold font-mono">{{ formatPrice(bigTrade?.price) }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm">Probability</span>
                <span class="bg-zinc-800 text-white px-2 py-0.5 rounded text-xs font-bold">{{ formatPercent(bigTrade?.price) }}</span>
              </div>
            </div>
          </div>

          <!-- Timestamp -->
          <div class="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5">
            <div class="flex items-center gap-2 mb-4 text-gray-400"><Clock :size="18" class="text-gray-400" /><span class="font-bold text-sm text-white">Timestamp</span></div>
            <div class="space-y-3">
              <div class="flex justify-between items-center border-b border-gray-800 pb-3">
                <span class="text-gray-500 text-sm">Executed At</span>
                <span class="text-white text-sm">{{ formatDate(bigTrade?.timestamp) }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm">Ends At</span>
                <span class="text-white text-sm">{{ formatDate(market.endDate) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile -->
        <div class="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <User :size="20" class="text-gray-400" />
            </div>

            <div>
              <div class="flex items-center gap-2">
                <span class="text-white font-bold">{{ bigTrade?.pseudonym || '—' }}</span>
              </div>
              <div class="text-xs text-gray-500">
                Trader
                <span class="mx-1">•</span>
                <span class="font-mono">{{ bigTrade?.proxyWallet || '—' }}</span>
              </div>
            </div>
          </div>

          <button class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-full flex items-center gap-2 transition-colors">
            <Eye :size="14" /> Add to Watchlist
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-3 gap-4 mb-12">
          <a :href="`https://polymarket.com/market/${market.slug}`" target="_blank" class="border border-gray-700 hover:border-gray-500 hover:bg-zinc-900 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all">
            <ExternalLink :size="16" /> View Market on Polymarket
          </a>

          <a :href="bigTrade ? `https://etherscan.io/tx/${bigTrade.transactionHash}` : '#'" target="_blank" class="border border-gray-700 hover:border-gray-500 hover:bg-zinc-900 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all">
            <ExternalLink :size="16" /> View Transaction
          </a>

          <button class="border border-gray-700 hover:border-gray-500 hover:bg-zinc-900 text-white py-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all">
            <Share2 :size="16" /> Share Trade
          </button>
        </div>

        <!-- Latest Trades list -->
        <div class="mb-8">
          <h3 class="text-white font-bold text-xl mb-4">Latest trades</h3>
          <div v-if="tradesLoading" class="text-gray-500">Loading trades...</div>
          <div v-else>
            <div v-for="t in trades" :key="t.transactionHash" class="mb-2">
              <div class="p-3 bg-[#0b0b0b] rounded">
                <div class="flex justify-between">
                  <div>{{ t.pseudonym || t.proxyWallet }}</div>
                  <div class="font-mono">{{ formatUSD(t.size * (t.price || market.prediction)) }}</div>
                </div>
                <div class="text-xs text-gray-400">{{ formatDate(t.timestamp) }} • {{ t.side }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Discussion -->
        <div>
          <h3 class="text-white font-bold text-xl mb-4 flex items-center gap-2"><MessageSquare :size="20" /> Discussion</h3>
          <div class="bg-[#050505] border border-gray-800 rounded-xl p-12 text-center">
            <p class="text-gray-500 mb-6">Sign In to join the discussion</p>
            <button class="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all">
              Sign In
              <ArrowLeft :size="16" class="rotate-180" />
            </button>
            <div class="mt-12 flex flex-col items-center gap-2 text-gray-600">
              <MessageSquare :size="32" stroke-width="1.5" />
              <p class="text-sm">No comments yet. Be the first to start the discussion!</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import {
  ArrowLeft,
  ExternalLink,
  Share2,
  Clock,
  DollarSign,
  TrendingDown,
  Target,
  User,
  MessageSquare,
  Sparkles,
  LayoutDashboard,
  Eye,
  History,
  Activity
} from "lucide-vue-next";
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const market = ref(null);
const trades = ref([]);
const loading = ref(true);
const tradesLoading = ref(true);
const error = ref('');

const insights = [
  "Large trade size ($13,719) suggests high conviction and could move the betting odds",
  "Extreme probability (99.7%) means small absolute changes can represent significant shifts in market belief",
  "Selling \"Yes\" increases supply and pushes the probability lower for this outcome",
  "Known trader activity - track this wallet for future market signals"
];

function formatDate(input) {
  if (!input) return '';
  const d = new window.Date(input);
  // If API returns unix seconds (number), convert
  if (typeof input === 'number' && String(input).length === 10) {
    d.setTime(input * 1000);
  }
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = monthNames[d.getMonth()];
  const day = String(d.getDate()).padStart(2,'0');
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12; if (hours === 0) hours = 12;
  const minutes = String(d.getMinutes()).padStart(2,'0');
  return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
}

const formatNumber = (v) => {
  if (v == null) return '—';
  if (typeof v === 'string') return v;
  return Math.round(v).toLocaleString();
};

const formatUSD = (v) => {
  if (v == null) return '—';
  return `$${Number(v).toLocaleString(undefined, {maximumFractionDigits:2})}`;
};

const formatPrice = (p) => {
  if (p == null) return '—';
  // price is 0..1
  return `$${(p).toFixed(4)}`;
};

const formatPercent = (p) => {
  if (p == null) return '—';
  return `${(p * 100).toFixed(2)}%`;
};

const isBuy = (type) => (type || '').toUpperCase() === 'BUY';

const goBack = () => router.back();

// computed helpers
const bigTrade = computed(() => trades.value.length ? trades.value[0] : null);
const bigTradeValue = computed(() => {
  const t = bigTrade.value;
  if (!t) return 0;
  return (t.size || 0) * (t.price || 0);
});

// simple direction / impact calculations (placeholder logic)
const impactScore = computed(() => {
  // simple heuristic: big trade size relative to liquidity
  const t = bigTrade.value;
  const liq = market.value?.liquidity || 1;
  if (!t) return 0;
  const ratio = (t.size || 0) / liq;
  const score = Math.min(100, Math.round(ratio * 1000));
  return score;
});
const impactLabel = computed(() => {
  const s = impactScore.value;
  if (s > 60) return 'HIGH IMPACT';
  if (s > 20) return 'MEDIUM IMPACT';
  return 'LOW IMPACT';
});
const impactBadgeClass = computed(() => {
  if (impactLabel.value === 'HIGH IMPACT') return 'bg-red-500/20 text-red-400';
  if (impactLabel.value === 'MEDIUM IMPACT') return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-blue-500/20 text-blue-400';
});

const directionHeadline = computed(() => {
  if (!market.value) return '';
  // example headline
  return `${bigTrade.value?.pseudonym || 'A trader'} executed a ${bigTrade.value?.side || 'trade'} on "${bigTrade.value?.outcome || market.value?.title}"`;
});
const directionBlurb = computed(() => {
  if (!market.value) return '';
  return `${bigTrade.value?.pseudonym || 'Trader'} placed a ${(bigTrade.value?.size || 0)} share ${bigTrade.value?.side || ''} at ${(bigTrade.value?.price != null) ? formatPercent(bigTrade.value.price) : '—'}.`;
});
const aiContext = computed(() => {
  return `This market currently shows ${formatPercent(market.value?.prob || market.value?.prediction || 0)} probability for the leading outcome. Use volume and liquidity to assess conviction.`;
});

onMounted(async () => {
  loading.value = true;
  tradesLoading.value = true;
  error.value = '';

  const slug = route.params.slug;

  try {
    // fetch market
    const { getMarket, getTrade } = usePolymarket()
    market.value = await getTrade(slug);

    // fetch trades for this market (server route)
    const tres = await getMarket(slug);
    trades.value = (tres?.trades || []).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));

  } catch (err) {
    console.error('Load error', err);
    error.value = err?.message || 'Failed to load market';
  } finally {
    loading.value = false;
    tradesLoading.value = false;
  }
});
</script>
