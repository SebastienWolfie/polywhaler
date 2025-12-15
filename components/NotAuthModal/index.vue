<template>
<div
  class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
>
  <div class="bg-[#0D1117] border border-white/10 rounded-xl p-8 w-full max-w-md text-center">
    
    <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-indigo-600/20 flex items-center justify-center">
      <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" stroke-width="1.7" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 12a5 5 0 1 0-5-5m10 0a5 5 0 1 0-5 5m0 0v3m0 3h.01" />
      </svg>
    </div>

    <h2 class="text-white font-bold text-lg">Sign in Required</h2>
    <p class="text-gray-400 text-sm mt-1 mb-5">
      You need to sign in to follow whales, sync your watchlist, and track activity.
    </p>

    <button
      @click="() => $emit('signInClicked')"
      class="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
      Sign In
    </button>

    <button
      @click="() => $emit('onClose')"
      class="mt-3 w-full py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5">
      Maybe Later
    </button>

  </div>
</div>

</template>

<script setup>
    
</script>