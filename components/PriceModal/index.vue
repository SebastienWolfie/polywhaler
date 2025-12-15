<script setup>
const emit = defineEmits(['onClose', 'noAuthClicked'])
const auth = useAuth()


function buttonClicked() {
    if (!auth.value.user) {
        emit('noAuthClicked')
        return;
    }

    alert('An error occured')
    emit('onClose')
}

const plans = [
  {
    name: 'Free',
    crown: false,
    subtitle: 'Basic whale tracking',
    price: '0',
    period: '',
    billedText: '',
    crypto: false,
    buttonText: 'Current Plan',
    buttonStyle: 'secondary', // gray outline
    highlight: false,
    features: [
      'View whale trades over $10k',
      'Basic market sentiment analysis',
      'Time-based filtering (1h, 6h, 24h, 7d)',
      'Real-time market prices (BTC, ETH, SPY, QQQ)',
      'Export Trade Data (CSV, JSON)',
      'Basic Email Alerts'
    ]
  },
  {
    name: 'Pro',
    crown: true,
    subtitle: 'Deep Trade & Profile Analysis',
    price: '4.99',
    period: '/month',
    billedText: 'Billed Monthly',
    crypto: true,
    buttonText: 'Get Monthly Plan',
    buttonStyle: 'primary', // gradient
    highlight: false,
    features: [
      'Everything in Free',
      'Connect your Web3 wallet (MetaMask, WalletConnect)',
      'View your Polymarket portfolio in real-time',
      'Execute trades directly through Polywhaler',
      'Follow whale signals and copy trades instantly',
      'Track your trading performance and P&L',
      'Whale Wallet Profiling (win rates, ROI tracking)',
      'Smart Money Leaderboards & Rankings'
    ]
  },
  {
    name: 'Pro',
    crown: true,
    subtitle: 'Deep Trade & Profile Analysis',
    price: '39.99',
    period: '/year',
    billedText: 'Billed Annually',
    subPrice: '$3.33/month',
    saveBadge: 'Save 33%',
    crypto: true,
    buttonText: 'Get Annual Plan',
    buttonStyle: 'primary', // gradient
    highlight: true, // This triggers the purple border/glow
    bestValue: true,
    features: [
      'Everything in Free',
      'Connect your Web3 wallet (MetaMask, WalletConnect)',
      'View your Polymarket portfolio in real-time',
      'Execute trades directly through Polywhaler',
      'Follow whale signals and copy trades instantly',
      'Track your trading performance and P&L',
      'Whale Wallet Profiling (win rates, ROI tracking)',
      'Smart Money Leaderboards & Rankings'
    ]
  }
]
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="() => $emit('onClose')"></div>

    <div class="relative w-full max-w-6xl bg-black border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
      
      <button 
        @click="() => $emit('onClose')" 
        class="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>

      <div class="p-8 md:p-10 overflow-y-auto custom-scrollbar">
        <div class="mb-10">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
          <p class="text-gray-400">Upgrade to Pro for advanced whale tracking features</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div 
            v-for="(plan, index) in plans" 
            :key="index"
            class="relative flex flex-col p-6 rounded-2xl bg-[#050505] transition-transform duration-300"
            :class="[
              plan.highlight 
                ? 'border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]' 
                : 'border border-gray-800'
            ]"
          >
            <div v-if="plan.bestValue" class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span class="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Best Value
              </span>
            </div>

            <div class="mb-6">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-2xl font-bold text-white">{{ plan.name }}</h3>
                <svg v-if="plan.crown" class="w-5 h-5 text-purple-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
              </div>
              
              <p class="text-gray-400 text-sm mb-4 min-h-[40px]">{{ plan.subtitle }}</p>

              <div class="flex flex-wrap gap-2 mb-4 min-h-[24px]">
                <span v-if="plan.billedText" class="text-[10px] font-semibold bg-gray-900 border border-gray-700 text-gray-300 px-2 py-0.5 rounded">
                  {{ plan.billedText }}
                </span>
                <span v-if="plan.crypto" class="flex items-center gap-1 text-[10px] font-semibold bg-green-900/20 border border-green-900 text-green-400 px-2 py-0.5 rounded">
                  <span class="text-[8px]">₿</span> Crypto accepted
                </span>
              </div>

              <div class="flex items-baseline mb-1">
                <span class="text-4xl font-bold text-white">${{ plan.price }}</span>
                <span v-if="plan.period" class="text-gray-400 ml-1">{{ plan.period }}</span>
              </div>

              <div class="flex items-center gap-2 h-6">
                <span v-if="plan.subPrice" class="text-gray-500 text-sm">{{ plan.subPrice }}</span>
                <span v-if="plan.saveBadge" class="text-[10px] font-bold bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded">
                  {{ plan.saveBadge }}
                </span>
              </div>
            </div>

            <ul class="space-y-3 mb-8 flex-grow">
              <li v-for="(feature, fIndex) in plan.features" :key="fIndex" class="flex items-start gap-3">
                <svg class="w-5 h-5 text-purple-500 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span class="text-gray-300 text-sm leading-tight">{{ feature }}</span>
              </li>
            </ul>

            <button 
              class="w-full py-3 rounded-lg font-bold text-sm transition-all duration-200"
              @click="() => buttonClicked()"
              :class="[
                plan.buttonStyle === 'primary' 
                  ? 'bg-gradient-to-r from-[#5b86e5] to-[#a855f7] text-white hover:opacity-90 shadow-lg shadow-purple-900/20' 
                  : 'bg-transparent border border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white cursor-default'
              ]"
            >
              {{ plan.buttonText }}
            </button>
            
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for content overflow */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0a0a0a;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>