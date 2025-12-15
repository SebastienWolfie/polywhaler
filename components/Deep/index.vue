<script setup>
  const youtubeVideoId = "nUHjl9l38g4";
  const embedUrl = `https://www.youtube.com/embed/${youtubeVideoId}`;

  const auth = useAuth()

</script>

<template>
  <div class="min-h-screen bg-black text-gray-200 font-sans pb-20">
    
    <div class="max-w-xl mx-auto px-4 pt-16 text-center">
      <div class="flex justify-center items-center gap-4 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
          Deep Trade
        </h1>
      </div>
      <p class="text-gray-400 text-sm mb-10">
        Your all-in-one Polymarket trading terminal powered by real-time whale intelligence
      </p>

      <div class="bg-gray-900/50 rounded-xl p-8 border border-white/10 text-left relative shadow-2xl shadow-purple-900/20">
        <div class="absolute top-4 right-4 flex items-center gap-2 text-xs text-gray-500">
             Powered by
             <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             <span class="font-semibold text-white">Polymarket</span>
        </div>

        <div class="flex items-center gap-3 text-xl font-semibold text-white mb-6 pt-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/><path d="M12 15v8"/><path d="M8 19h8"/></svg>
            Dive deeper and trade with the whales
        </div>

        <p class="text-gray-400 text-sm mb-6">
          Upgrade to **Pro** to access wallet connection and execute trades powered by whale intelligence
        </p>

        <ul class="space-y-4 mb-8">
          <li class="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-400 mt-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h1a4 4 0 0 0 0 8h-1"/><path d="M10 9v6"/><path d="M14 9v6"/><path d="M12 21v-3"/></svg>
            <div>
              <div class="text-white font-medium">Execute Trades Directly</div>
              <p class="text-gray-500 text-sm">Place buy and sell orders using your connected wallet</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-400 mt-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 19H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v3"/><path d="M17 19h2a2 2 0 0 0 2-2v-3"/><path d="M18 10h.01"/><path d="M16 10h.01"/><path d="M14 10h.01"/><path d="M17 14h-3a2 2 0 0 0-2 2v4"/></svg>
            <div>
              <div class="text-white font-medium">Follow Whale Trades</div>
              <p class="text-gray-500 text-sm">One-click whale following with insider score analysis</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-400 mt-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 0 1-8-8c0-2.34 1.15-4.46 3-5.83M12 20a8 8 0 0 0 8-8c0-2.34-1.15-4.46-3-5.83M12 4v20"/><path d="M4 12H20"/><path d="M18 16l3-3-3-3"/><path d="M6 16l-3-3 3-3"/></svg>
            <div>
              <div class="text-white font-medium">Track Performance</div>
              <p class="text-gray-500 text-sm">Monitor your portfolio and compare against whales</p>
            </div>
          </li>
        </ul>

        <div class="w-full aspect-video rounded-lg overflow-hidden">
          <iframe
            class="w-full h-full"
            :src="embedUrl"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>


        <div class="text-center mt-10"
             @click="() => auth.showPriceModal()">
            <button class="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-base font-bold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/30">
                Upgrade to Pro
            </button>
        </div>
      </div>
    </div>
    

  </div>
</template>