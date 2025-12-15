<template>
  <div class="min-h-screen bg-black text-gray-300 font-sans selection:bg-blue-500/30">

    <main class="max-w-7xl mx-auto px-6 py-8">

      <div v-if="pending" class="flex flex-col items-center justify-center h-64 space-y-4">
        <RotateCw :size="32" class="animate-spin text-blue-500" />
        <p class="text-gray-500 text-sm">Tracking whale movements...</p>
      </div>

      <div v-else-if="error" class="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
        <h3 class="text-red-400 font-bold mb-2">Could not load profile</h3>
        <p class="text-gray-500 text-sm">{{ error.message }}</p>
        <button @click="refresh" class="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition">
          Try Again
        </button>
      </div>

      <div v-else class="animate-fade-in">

        <div class="bg-[#050505] border border-gray-800 rounded-2xl p-6 mb-8 relative">

          <div class="flex justify-between items-start mb-6">
            <button @click="router.back()" class="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <ArrowLeft :size="16" /> Back
            </button>

            <button @click="refresh" :disabled="pending" class="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors border border-gray-800 rounded-full px-3 py-1 hover:bg-gray-900 disabled:opacity-50">
              <RotateCw :size="14" :class="{ 'animate-spin': pending }" /> Refresh
            </button>
          </div>

          <div class="flex flex-col lg:flex-row items-start gap-6">
            <div class="w-20 h-20 rounded-full bg-gradient-to-b from-[#a3e6aa] to-[#7dbf85] shadow-lg shrink-0 flex items-center justify-center text-black font-bold text-2xl">
                {{ (profile?.traderName || 'W').charAt(0).toUpperCase() }}
            </div>

            <div class="space-y-3 w-full">
              <div class="flex items-center gap-3">
                <h1 class="text-3xl font-bold text-white">{{ profile?.traderName || 'Unknown Whale' }}</h1>
                <button @click="copyToClipboard" class="text-gray-500 cursor-pointer hover:text-gray-300 transition">
                    <Copy :size="16" />
                </button>
                <span v-if="copied" class="text-xs text-green-500 font-medium">Copied!</span>
              </div>

              <div class="text-gray-600 w-full truncate font-mono text-sm">
                {{ profile?.wallet }}
              </div>

              <div class="flex flex-wrap gap-3 mt-2">
                <span :class="scoreBadgeColor" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border">
                  ◎ Score: {{ profile?.smartMoneyScore || 0 }}/100
                </span>

                <span v-if="isLikelyInsider" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  ◎ Likely Insider
                </span>
                <span v-else class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  ◎ Unlikely Insider
                </span>

                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                  ◎ {{ profile?.riskProfile || 'Standard' }} Risk
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

          <div class="bg-[#050505] border border-gray-800 rounded-2xl p-6">
            <div class="flex items-center gap-2 mb-4 text-gray-500 text-sm">
              <Activity :size="16" />
              <span>Total Trades</span>
            </div>

            <div class="mb-2">
              <h2 class="text-3xl font-bold text-white">{{ profile?.stats?.totalTrades || 0 }}</h2>
              <p class="text-gray-500 text-xs mt-1">{{ uniqueTradesCount }} unique markets</p>
            </div>

            <div class="mt-6 text-xs font-medium flex flex-wrap gap-x-2">
              <span class="text-green-500">{{ profile?.stats?.activeTrades || 0 }} Active</span>
              <span class="text-gray-600">-</span>
              <span class="text-orange-500">{{ profile?.stats?.pendingCount || 0 }} Pending</span>
              <span class="text-gray-600">-</span>
              <span class="text-blue-500">{{ profile?.stats?.resolvedTrades || 0 }} Resolved</span>
            </div>
          </div>

          <div class="bg-[#050505] border border-gray-800 rounded-2xl p-6">
            <div class="flex items-center gap-2 mb-4 text-gray-500 text-sm">
              <Target :size="16" />
              <span>Win Rate</span>
            </div>

            <div>
              <h2 :class="winRateColor" class="text-3xl font-bold">{{ formatPercent(profile?.stats?.winRate) }}</h2>
              <p class="text-gray-500 text-xs mt-1">{{ profile?.stats?.resolvedTrades || 0 }} resolved trades</p>
            </div>
          </div>

          <div class="bg-[#050505] border border-gray-800 rounded-2xl p-6">
            <div class="flex items-center gap-2 mb-4 text-gray-500 text-sm">
              <DollarSign :size="16" />
              <span>Total Volume</span>
            </div>

            <div>
              <h2 class="text-3xl font-bold text-white">{{ formatCompact(profile?.stats?.totalVolume) }}</h2>
              <p class="text-gray-500 text-xs mt-1">Avg: {{ formatUSD(profile?.stats?.avgTradeSize) }}</p>
            </div>
          </div>

          <div class="bg-[#050505] border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
            <div class="flex items-center gap-2 mb-4 text-gray-500 text-sm">
              <TrendingUp :size="16" :class="pnlColor(profile?.stats?.totalProfitLoss)" />
              <span>Total P&L</span>
            </div>

            <div class="mb-8">
              <h2 :class="pnlColor(profile?.stats?.totalProfitLoss)" class="text-3xl font-bold">
                {{ formatPnl(profile?.stats?.totalProfitLoss) }}
              </h2>
              <p class="text-gray-500 text-xs mt-1">
                From {{ profile?.stats?.resolvedTrades }} closed + {{ profile?.stats?.activeTrades }} active
              </p>
            </div>

            <div class="text-xs space-y-1">
              <div class="flex justify-between">
                <span class="text-gray-500">Realized:</span>
                <span :class="pnlColor(profile?.stats?.realizedPnL)" class="font-mono">
                    {{ formatPnl(profile?.stats?.realizedPnL) }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-gray-500">Unrealized:</span>
                <span :class="pnlColor(unrealizedPnL)" class="font-mono">
                    {{ formatPnl(unrealizedPnL) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-[#050505] border border-gray-800 rounded-2xl p-6">
            <div class="flex items-center gap-2 mb-4 text-gray-500 text-sm">
              <DollarSign :size="16" />
              <span>Portfolio Value</span>
            </div>

            <div>
              <h2 class="text-3xl font-bold text-blue-500">{{ formatUSD(profile?.stats?.portfolioValue) }}</h2>
              <p class="text-gray-500 text-xs mt-1">Current holdings value</p>
            </div>
          </div>
        </div>

        <div class="relative mt-8 rounded-2xl border border-gray-800 bg-[#050505] p-12 text-center overflow-hidden">
          <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>

          <div class="relative z-10 flex flex-col items-center justify-center">
            <h3 class="text-xl font-bold text-white mb-2">Detailed Whale Analysis</h3>
            <p class="text-gray-500 text-sm mb-6 max-w-md">
              Unlock detailed performance metrics, trading patterns, category breakdowns, and insider risk analysis for {{ profile?.traderName }}.
            </p>

            <button @click="()=> navigateTo('/deep')" class="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20">
              <Sparkles :size="14" class="text-yellow-300"/>
              Upgrade to Pro
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  RotateCw,
  Copy,
  Activity,
  Target,
  DollarSign,
  TrendingUp,
  Sparkles,
} from 'lucide-vue-next';

// 1. Router & Data Fetching
const route = useRoute();
const router = useRouter();
const address = route.params.address;

// Fetch data from our server proxy
const { data: profile, pending, error, refresh } = await useFetch(`/api/polymarket/whale/${address}`);
console.log(profile.value)

// 2. Computed Logic

// Calculate Unrealized PnL manually from positions if not provided in stats
const unrealizedPnL = computed(() => {
    if (!profile.value) return 0;
    // Method 1: Total - Realized
    const total = profile.value.stats?.totalProfitLoss || 0;
    const realized = profile.value.stats?.realizedPnL || 0;
    return total - realized;
});

// Calculate unique trades (distinct slugs)
const uniqueTradesCount = computed(() => {
    if(!profile.value?.rawData?.trades) return 0;
    const slugs = new Set(profile.value.rawData.trades.map(t => t.eventSlug));
    return slugs.size;
});

// Badges Logic
const isLikelyInsider = computed(() => {
    return (profile.value?.avgInsiderScore || 0) > 50;
});

const scoreBadgeColor = computed(() => {
    const score = profile.value?.smartMoneyScore || 0;
    if (score >= 75) return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (score >= 50) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
});

const winRateColor = computed(() => {
    const rate = profile.value?.stats?.winRate || 0;
    if (rate >= 60) return 'text-[#00ff9d]';
    if (rate <= 40) return 'text-red-500';
    return 'text-white';
});

// 3. Helpers
const copied = ref(false);
const copyToClipboard = () => {
    if(profile.value?.wallet) {
        navigator.clipboard.writeText(profile.value.wallet);
        copied.value = true;
        setTimeout(() => copied.value = false, 2000);
    }
};

const formatUSD = (val) => {
    if (val === undefined || val === null) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

const formatCompact = (val) => {
    if (val === undefined || val === null) return '$0';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(val);
};

const formatPnl = (val) => {
    if (val === undefined || val === null) return '$0.00';
    const formatted = formatUSD(Math.abs(val));
    return val >= 0 ? `+${formatted}` : `-${formatted}`;
};

const formatPercent = (val) => {
    if (val === undefined || val === null) return '0.0%';
    return `${Number(val).toFixed(1)}%`;
};

const pnlColor = (val) => {
    if (!val) return 'text-gray-400';
    return val >= 0 ? 'text-[#00ff9d]' : 'text-red-500';
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>