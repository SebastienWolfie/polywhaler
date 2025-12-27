<script setup>
import { ref, computed, watch, onMounted } from 'vue'; // <--- CRITICAL: Ensure these imports are present

// --- CONFIG & STATE ---
const timeRanges = ['1h', '6h', '12h', '24h', '48h'];
const activeRange = ref('24h');
const rawTrades = ref([]);
const isLoading = ref(true);

// --- COMPOSABLE (Inlined for simplicity) ---
const { getHistoryStats } = usePolymarket();

// --- FETCH DATA ---
onMounted(() => fetchTrades());
// This watch block IS correct for triggering the fetch on change
watch(activeRange, () => fetchTrades());

async function fetchTrades() {
  isLoading.value = true;
  rawTrades.value = []; // Clear old data immediately for a responsive feel
  try {
    const response = await getHistoryStats(activeRange.value);
    // const response = await useAsyncData(`trade-${activeRange.value}`, () => getHistoryStats(activeRange.value), {
    //   transform: (data) => JSON.parse(JSON.stringify(data))
    // })
    
    if (Array.isArray(response) && response.length > 0) {
      // Data is correctly loaded and sorted in the backend
      rawTrades.value = response;
    } else {
      rawTrades.value = [];
    }
  } catch (e) {
    console.error("Failed to load trades", e);
    rawTrades.value = [];
  } finally {
    isLoading.value = false;
  }
}

// --- STATS CARDS ---
const stats = computed(() => {
  // All calculations MUST reference rawTrades.value
  const trades = rawTrades.value; 
  if (!trades.length) return [
    { label: 'Total Volume', value: isLoading.value ? '...' : '$0.00', sub: 'No data', icon: '' },
    { label: 'Total Trades', value: isLoading.value ? '...' : '0', sub: 'No data', icon: '' },
    { label: 'Est. Daily Volume', value: isLoading.value ? '...' : '$0.00', sub: 'Per 24h', icon: '' },
    { label: 'Est. Daily Trades', value: isLoading.value ? '...' : '0', sub: 'Per 24h', icon: '' }
  ];

  const totalVol = trades.reduce((acc, t) => acc + (t.size * t.price), 0);
  const count = trades.length;
  
  const hours = parseInt(activeRange.value) || 24;
  const days = hours / 24; 
  
  const dailyVol = days <= 1 ? totalVol * (24/hours) : totalVol / days;
  const dailyTrades = days <= 1 ? count * (24/hours) : count / days;

  return [
    { label: 'Total Volume', value: formatCurrency(totalVol), sub: `Last ${activeRange.value}`, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { label: 'Total Trades', value: formatNumber(count), sub: `Last ${activeRange.value}`, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Est. Daily Volume', value: formatCurrency(dailyVol), sub: 'Per 24h', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { label: 'Est. Daily Trades', value: formatNumber(Math.round(dailyTrades)), sub: 'Per 24h', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
  ];
});

// --- CHART HELPERS ---
function createBuckets(data, width, height, getValue, bucketsCount = 20) {
  if (!data.length) return [];
  
  const buckets = Array(bucketsCount).fill(0);
  const startTime = data[0].timestamp;
  const endTime = data[data.length - 1].timestamp;
  const duration = endTime - startTime || 1;

  data.forEach(t => {
    const offset = t.timestamp - startTime;
    const idx = Math.min(Math.floor((offset / duration) * bucketsCount), bucketsCount - 1);
    buckets[idx] += getValue(t);
  });

  const maxVal = Math.max(...buckets, 1);
  
  // Map to SVG coordinates (Y is inverted)
  return buckets.map((val, i) => ({
    x: (i / (bucketsCount - 1)) * width,
    y: height - ((val / maxVal) * (height - 20)) - 10, // leave 10px padding
    val // keep original value for scaling labels
  }));
}

const getSmoothPath = (points) => {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = points[i-1].x + (points[i].x - points[i-1].x) / 2;
    const cp1y = points[i-1].y;
    const cp2x = points[i-1].x + (points[i].x - points[i-1].x) / 2;
    const cp2y = points[i].y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${points[i].x} ${points[i].y}`;
  }
  return d;
}

// --- CHARTS LOGIC: Now correctly dependent on rawTrades.value ---

// 1. Volume Chart
const volumeData = computed(() => createBuckets(rawTrades.value, 840, 150, (t) => t.size * t.price));
const volumePath = computed(() => {
  if (!volumeData.value.length) return "M0,150 L840,150";
  const line = getSmoothPath(volumeData.value);
  return `${line} L 840,150 L 0,150 Z`; 
});
const volumeMaxY = computed(() => {
    if(!volumeData.value.length) return 0;
    return Math.max(...volumeData.value.map(p => p.val));
});

// 2. Count Chart
const countPoints = computed(() => createBuckets(rawTrades.value, 840, 150, () => 1));
const countPath = computed(() => getSmoothPath(countPoints.value));
const countMaxY = computed(() => countPoints.value.length ? Math.max(...countPoints.value.map(p=>p.val)) : 0);

// 3. Buy/Sell Bars
const bars = computed(() => {
  const trades = rawTrades.value;
  if (!trades.length) return [];
  
  const bucketCount = 20;
  const result = Array.from({length: bucketCount}).map((_, i) => ({ x: i * 42 + 10, buyH: 0, sellH: 0 }));
  
  const start = trades[0].timestamp;
  const end = trades[trades.length-1].timestamp;
  
  trades.forEach(t => {
     const idx = Math.min(Math.floor(((t.timestamp - start)/(end - start || 1)) * bucketCount), bucketCount-1);
     const val = t.size * t.price;
     if (t.side === 'BUY') result[idx].buyH += val;
     else result[idx].sellH += val;
  });
  
  const maxVal = Math.max(...result.map(b => Math.max(b.buyH, b.sellH)), 1);
  return result.map(b => ({
     x: b.x,
     buyH: (b.buyH / maxVal) * 120, // Max height 120px
     sellH: (b.sellH / maxVal) * 120
  }));
});
// 4. Avg Trade Size
const sizePoints = computed(() => {
    const trades = rawTrades.value;
    if (!trades.length) return [];
    
    const count = 20;
    const width = 950;
    const height = 150;
    
    const buckets = Array(count).fill(0).map(() => ({ sum: 0, count: 0 }));
    const start = trades[0].timestamp;
    const end = trades[trades.length-1].timestamp;
    
    trades.forEach(t => {
        const idx = Math.min(Math.floor(((t.timestamp - start)/(end-start||1)) * count), count-1);
        buckets[idx].sum += (t.size * t.price);
        buckets[idx].count += 1;
    });
    
    const avgs = buckets.map(b => b.count ? b.sum/b.count : 0);
    const maxVal = Math.max(...avgs, 1);
    
    return avgs.map((val, i) => ({
        x: (i / (count - 1)) * width,
        y: height - ((val / maxVal) * (height - 30)) - 10,
        val
    }));
});
const sizePath = computed(() => getSmoothPath(sizePoints.value));
const sizeMaxY = computed(() => sizePoints.value.length ? Math.max(...sizePoints.value.map(p=>p.val)) : 0);

// --- AXIS LABELS GENERATOR ---
const timeLabels = computed(() => {
    const count = 7; // Number of labels to display
    const trades = rawTrades.value;
    if (trades.length < 2) return Array(count).fill('--');
    
    const start = trades[0].timestamp * 1000;
    const end = trades[trades.length - 1].timestamp * 1000;
    const step = (end - start) / (count - 1);
    
    return Array.from({length: count}).map((_, i) => {
        const date = new window.Date(start + (step * i));
        
        // Use different formatting for short ranges
        const isShortRange = ['1h', '3h', '6h'].includes(activeRange.value);
        
        return isShortRange
            ? date.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})
            : date.toLocaleDateString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
    });
});

// --- FORMATTERS ---
function formatCurrency(val) {
  if (val >= 1000000) return `$${(val/1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val/1000).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}
function formatNumber(val) {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
</script>

<template>
  <div class="min-h-screen bg-black text-white font-sans pb-20">
    <main class="max-w-7xl mx-auto px-4 pt-10">
      
      <div class="flex justify-between items-center mb-8 bg-[#050505] p-2 rounded-xl border border-white/5">
        <div class="text-sm font-medium text-gray-400 ml-4">
            <span v-if="isLoading" class="animate-pulse text-blue-500">Live Updating...</span>
            <span v-else>Time Range</span>
        </div>
        <div class="flex bg-black rounded-lg p-1 border border-white/5">
          <button 
            v-for="range in timeRanges" 
            :key="range"
            @click="activeRange = range"
            :class="`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${range === activeRange ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-500 hover:text-white'}`"
          >
            {{ range }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div v-for="(stat, index) in stats" :key="index" class="bg-[#050505] p-6 rounded-2xl border border-white/5">
          <div class="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" :d="stat.icon" />
            </svg>
            {{ stat.label }}
          </div>
          <div class="text-3xl font-bold text-white mb-1 transition-all duration-300">{{ stat.value }}</div>
          <div class="text-[10px] text-gray-600">{{ stat.sub }}</div>
        </div>
      </div>

      <div class="bg-[#050505] p-6 rounded-2xl border border-white/5 mb-6">
        <div class="text-sm font-bold text-white mb-6">Trading Volume Over Time</div>
        <div class="relative h-64 w-full">
          <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-gray-700 font-mono pointer-events-none pb-6">
            <span>{{ formatCurrency(volumeMaxY) }}</span>
            <span>{{ formatCurrency(volumeMaxY * 0.75) }}</span>
            <span>{{ formatCurrency(volumeMaxY * 0.5) }}</span>
            <span>{{ formatCurrency(volumeMaxY * 0.25) }}</span>
            <span>0</span>
          </div>
          <div class="ml-10 h-full relative">
             <svg class="w-full h-full" viewBox="0 0 840 150" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
                   <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                 </linearGradient>
               </defs>
               <line x1="0" y1="37.5" x2="840" y2="37.5" stroke="#ffffff" stroke-opacity="0.03" />
               <line x1="0" y1="75" x2="840" y2="75" stroke="#ffffff" stroke-opacity="0.03" />
               <line x1="0" y1="112.5" x2="840" y2="112.5" stroke="#ffffff" stroke-opacity="0.03" />
               
               <path :d="volumePath" fill="url(#volGradient)" stroke="#3b82f6" stroke-width="2" class="transition-all duration-500 ease-in-out"/>
             </svg>
             <div class="absolute bottom-[-20px] w-full flex justify-between text-[9px] text-gray-700 font-mono">
                <span v-for="(label, i) in timeLabels" :key="i">{{ label }}</span>
             </div>
          </div>
        </div>
      </div>

      <div class="bg-[#050505] p-6 rounded-2xl border border-white/5 mb-6">
        <div class="text-sm font-bold text-white mb-6">Trade Count Over Time</div>
        <div class="relative h-64 w-full">
          <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-gray-700 font-mono pointer-events-none pb-6">
            <span>{{ formatNumber(Math.round(countMaxY)) }}</span>
            <span>{{ formatNumber(Math.round(countMaxY * 0.5)) }}</span>
            <span>0</span>
          </div>
          <div class="ml-10 h-full relative">
             <svg class="w-full h-full" viewBox="0 0 840 150" preserveAspectRatio="none">
               <line x1="0" y1="37.5" x2="840" y2="37.5" stroke="#ffffff" stroke-opacity="0.03" />
               <line x1="0" y1="75" x2="840" y2="75" stroke="#ffffff" stroke-opacity="0.03" />
               <line x1="0" y1="112.5" x2="840" y2="112.5" stroke="#ffffff" stroke-opacity="0.03" />

               <path :d="countPath" fill="none" stroke="#10b981" stroke-width="2" class="transition-all duration-500"/>
               
               <circle v-for="(p, i) in countPoints" :key="i" :cx="p.x" :cy="p.y" r="2.5" fill="#000" stroke="#10b981" stroke-width="2" />
             </svg>
             <div class="absolute bottom-[-20px] w-full flex justify-between text-[9px] text-gray-700 font-mono">
                <span v-for="(label, i) in timeLabels" :key="i">{{ label }}</span>
             </div>
          </div>
        </div>
      </div>

      <div class="bg-[#050505] p-6 rounded-2xl border border-white/5 mb-6">
        <div class="text-sm font-bold text-white mb-6">Buy vs Sell Volume</div>
        <div class="relative h-64 w-full">
          <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-gray-700 font-mono pointer-events-none pb-6">
            <span>MAX</span><span>MID</span><span>0</span>
          </div>
          <div class="ml-10 h-full relative">
             <svg class="w-full h-full" viewBox="0 0 840 150" preserveAspectRatio="none">
               <line x1="0" y1="37.5" x2="840" y2="37.5" stroke="#ffffff" stroke-opacity="0.03" />
               <line x1="0" y1="75" x2="840" y2="75" stroke="#ffffff" stroke-opacity="0.03" />
               <line x1="0" y1="112.5" x2="840" y2="112.5" stroke="#ffffff" stroke-opacity="0.03" />

               <g v-for="(bar, i) in bars" :key="i" class="transition-all duration-500">
                 <rect :x="bar.x" :y="150 - bar.buyH" width="12" :height="bar.buyH" fill="#22c55e" />
                 <rect :x="bar.x + 14" :y="150 - bar.sellH" width="12" :height="bar.sellH" fill="#ef4444" />
               </g>
             </svg>
             <div class="flex justify-center gap-4 mt-6 text-[10px] font-bold">
               <div class="flex items-center gap-1 text-green-500">
                 <div class="w-2 h-2 bg-green-500 rounded-sm"></div> Buy Volume ($)
               </div>
               <div class="flex items-center gap-1 text-red-500">
                 <div class="w-2 h-2 bg-red-500 rounded-sm"></div> Sell Volume ($)
               </div>
             </div>
          </div>
        </div>
      </div>

      <div class="bg-[#050505] p-6 rounded-2xl border border-white/5 mb-6">
        <div class="text-sm font-bold text-white mb-6">Average Trade Size</div>
        <div class="relative h-64 w-full">
          <div class="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-gray-700 font-mono pointer-events-none pb-6">
            <span>{{ formatCurrency(sizeMaxY) }}</span>
            <span>{{ formatCurrency(sizeMaxY * 0.5) }}</span>
            <span>0</span>
          </div>
          <div class="ml-10 h-full relative">
             <svg class="w-full h-full" viewBox="0 0 950 150" preserveAspectRatio="none">
               <line x1="0" y1="37.5" x2="950" y2="37.5" stroke="#ffffff" stroke-opacity="0.03" />
               <line x1="0" y1="75" x2="950" y2="75" stroke="#ffffff" stroke-opacity="0.03" />
               <line x1="0" y1="112.5" x2="950" y2="112.5" stroke="#ffffff" stroke-opacity="0.03" />

               <path :d="sizePath" fill="none" stroke="#f59e0b" stroke-width="2" class="transition-all duration-500"/>
               <circle v-for="(p, i) in sizePoints" :key="i" :cx="p.x" :cy="p.y" r="2.5" fill="#000" stroke="#f59e0b" stroke-width="2" />
             </svg>
             <div class="absolute bottom-[-20px] w-full flex justify-between text-[9px] text-gray-700 font-mono px-4">
                <span v-for="(label, i) in timeLabels" :key="i">{{ label }}</span>
             </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>