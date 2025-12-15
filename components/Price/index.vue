<script setup>
  import axios from 'axios';

const cards = reactive([
  {
    id: 'bitcoin',
    asset: 'Bitcoin',
    ticker: 'BTC',
    iconColor: 'bg-[#F7931A]', 
    // Dim Red Background for Bitcoin (Down trend)
    cardBg: 'bg-red-950/20', 
    borderColor: 'border-red-900/50', 
    glowColor: 'shadow-red-900/10',
    confidence: 85,
    confidenceColor: 'bg-blue-600',
    currentPrice: 0,
    predictedPrice: 0,
    movementLabel: 'Expected Movement',
    movementValue: 0,
    movementColor: 'text-red-500',
    isUp: false,
    stats: [
      { label: 'Momentum', value: 'neutral' },
      { label: 'Volatility', value: 'medium' },
      { label: 'Whale Activity', value: 'neutral' }
    ],
    analysis: [
      '13 active Bitcoin price prediction markets analyzed ($676K total volume)',
      'Nearest target: Will the price of Bitcoin be above $84,000 on December 6? (7 days away)',
      'Market odds: 100% probability of reaching $84,000',
      'Whale positioning: Neutral - balanced bets across outcomes',
      'Current momentum: -2.16% (24h)'
    ]
  },
  {
    id: 'ethereum',
    asset: 'Ethereum',
    ticker: 'ETH',
    iconColor: 'bg-[#627EEA]', 
    // Dim Green Background for Ethereum (Up trend)
    cardBg: 'bg-green-950/20',
    borderColor: 'border-green-900/50', 
    glowColor: 'shadow-green-900/10',
    confidence: 83,
    confidenceColor: 'bg-blue-600',
    currentPrice: 0,
    predictedPrice: 0,
    movementLabel: 'Expected Movement',
    movementValue: 0,
    movementColor: 'text-green-500',
    isUp: true,
    stats: [
      { label: 'Momentum', value: 'neutral' },
      { label: 'Volatility', value: 'medium' },
      { label: 'Whale Activity', value: 'neutral' }
    ],
    analysis: [
      '4 active Ethereum price prediction markets analyzed ($76K total volume)',
      'Nearest target: Will Ethereum reach $3,500 December 1-7? (7 days away)',
      'Market odds: 99% probability of reaching $3,500',
      'Whale positioning: Bearish (21% directional bias)',
      'Current momentum: -3.39% (24h)'
    ]
  },
  {
    id: 'solana',
    asset: 'Solana',
    ticker: 'SOL',
    iconColor: 'bg-[#14F195]', 
    // Dim Red Background for Solana (Down trend)
    cardBg: 'bg-red-950/20',
    borderColor: 'border-red-900/50',
    glowColor: 'shadow-red-900/10',
    confidence: 50,
    confidenceColor: 'bg-gray-700', // Lower confidence usually gray or dark
    currentPrice: 0,
    predictedPrice: 0,
    movementLabel: 'Expected Movement',
    movementValue: 0,
    movementColor: 'text-red-500',
    isUp: false,
    stats: [
      { label: 'Momentum', value: 'neutral' },
      { label: 'Volatility', value: 'medium' },
      { label: 'Whale Activity', value: 'neutral' }
    ],
    analysis: [
      'Limited Solana price prediction markets available',
      'Analysis based on current momentum: -3.60% (24h)',
      'Neutral whale sentiment - no strong directional bets detected'
    ]
  }
])


onMounted(() => {
  fetchCryptoData(); // initial load
  // setInterval(fetchCryptoData, 5000); // update every 5 seconds
});


async function fetchCryptoData() {
  try {
    // CoinGecko simple price API
    const ids = cards.map(c => c.id).join(',');
    console.log('ids', ids)
    const { getPrice } = useCoingecko();
    const response = await getPrice(ids);
    console.log(response)

    if (response.error) return

    cards.forEach(card => {
      const data = response[card.id];
      if (!data) return;

      const current = data.usd
      const change = data.usd_24h_change

      card.currentPrice = current.toFixed(2);
      card.movementValue = change.toFixed(2);
      card.isUp = change >= 0;
      card.predictedPrice = (current * (1 + change / 100)).toFixed(2)

      // Update movement color dynamically
      card.movementColor = card.isUp ? 'text-green-500' : 'text-red-500';

      // Optional: change background slightly based on movement
      card.cardBg = card.isUp ? 'bg-green-950/20' : 'bg-red-950/20';
      card.borderColor = card.isUp ? 'border-green-900/50' : 'border-red-900/50';
      card.glowColor = card.isUp ? 'shadow-green-900/10' : 'shadow-red-900/10';
    });
  } catch (error) {
    console.error('Error fetching crypto data:', error);
  }
}

</script>

<template>
  <div class="min-h-screen bg-black text-white font-sans pb-20">
    

    <main class="max-w-7xl mx-auto px-4 pt-10">
      
      <div class="bg-blue-950/20 border border-blue-900/50 rounded-2xl p-6 mb-8 flex justify-between items-center shadow-lg shadow-blue-900/5">
        <h1 class="text-xl font-bold flex items-center gap-3 text-purple-100">
          <span class="text-purple-500">
             <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </span> 
          Crypto Price Predictions
        </h1>
        <!-- <div class="text-[11px] text-gray-400 font-medium">Updated {{  }}</div> -->
      </div>

      <div v-for="card in cards" :key="card.id" :class="`relative ${card.cardBg} rounded-2xl p-6 border ${card.borderColor} mb-6 shadow-xl ${card.glowColor}`">
        
        <div class="flex justify-between items-start mb-8">
          <div class="flex gap-4">
            <div :class="`w-10 h-10 rounded-lg ${card.iconColor} flex items-center justify-center text-white font-bold shadow-lg`">
              <svg v-if="card.ticker === 'BTC'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.24 14.9.358c6.43 1.605 10.341 8.115 8.738 14.548v-.002z" fill="none"></path><path d="M23.948 10.615c1.77-7.08-2.67-14.34-9.752-16.108C7.114-7.26 1.134-4.135-.635 2.946c-1.77 7.085 2.672 14.342 9.754 16.108 7.082 1.77 14.34-2.67 16.107-9.753l.002-.007.005.004.008-.026.005.005zm-22.36 2.37C-.14 5.96 4.303.407 11.332 2.162c6.945 1.74 11.232 8.79 9.488 15.815-1.748 7.026-8.8 11.228-15.828 9.488-6.942-1.74-11.23-8.792-9.484-15.815l.08.035.002-.006z" fill="white"></path></svg>
              <svg v-else-if="card.ticker === 'ETH'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="currentColor"><path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781L16.498 4 9 16.22l7.498 4.353 7.496-4.354zM24 17.616l-7.502 4.351L9 17.617l7.498 10.378 7.502-10.379z" fill="white"></path></svg>
              <span v-else class="text-sm font-bold text-black">SOL</span>
            </div>
            <div>
              <div class="text-lg font-bold text-white leading-none mb-1">{{ card.asset }}</div>
              <div class="text-gray-500 text-xs font-medium">{{ card.ticker }} • 7 days forecast</div>
            </div>
          </div>
          <div :class="`${card.confidenceColor} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg`">
            {{ card.confidence }}% confidence
          </div>
        </div>

        <div class="flex justify-between items-center mb-6 px-1">
          <div>
            <div class="text-gray-500 text-[10px] font-bold mb-1">Current Price</div>
            <div class="text-2xl font-bold tracking-tight text-white">${{ formatMoney(card.currentPrice) }}</div>
          </div>
          <div class="text-right">
            <div class="text-gray-500 text-[10px] font-bold mb-1">Predicted Price</div>
            <div class="text-2xl font-bold tracking-tight text-white">${{ formatMoney(card.predictedPrice) }}</div>
          </div>
        </div>

        <div class="bg-[#050505]/40 rounded-xl p-4 mb-4 border border-white/5">
          <div class="text-gray-500 text-[10px] font-medium mb-1 ml-1">Expected Movement</div>
          <div :class="`text-4xl font-bold ${card.movementColor} flex items-center gap-2`">
            <svg v-if="card.isUp" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="7" x2="7" y2="17"></line><polyline points="17 17 7 17 7 7"></polyline></svg>
            {{ card.movementValue }}%
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <div v-for="(stat, idx) in card.stats" :key="idx" class="bg-[#050505]/40 rounded-xl py-3 border border-white/5 flex flex-col items-center justify-center">
            <div class="text-gray-500 text-[9px] uppercase font-bold mb-2 tracking-wider">{{ stat.label }}</div>
            <div class="bg-[#1a1a1a] text-gray-300 text-[10px] font-bold px-3 py-1 rounded-full">
              {{ stat.value }}
            </div>
          </div>
        </div>

        <div class="mb-6 pt-2">
          <div class="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            <span class="text-sm font-bold text-white">Analysis</span>
          </div>
          <div class="space-y-4 pl-1">
            <div v-for="(line, idx) in card.analysis" :key="idx" class="flex items-start gap-3">
              <div class="w-1 h-1 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
              <p class="text-[11px] text-gray-400 font-medium leading-relaxed">{{ line }}</p>
            </div>
          </div>
        </div>

        <div class="text-[9px] text-gray-600 border-t border-white/5 pt-4 font-medium">
          Disclaimer: Predictions are based on analysis combining whale trading patterns, real-time market data, and technical indicators. Not financial advice. Always DYOR.
        </div>

      </div>

    </main>

  </div>
</template>