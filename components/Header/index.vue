<template>
  <header class="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2">
        <div class="text-blue-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/>
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 15v8"/>
            <path d="M8 19h8"/>
          </svg>
        </div>
        <span class="font-bold text-white text-lg tracking-tight">Polywhaler</span>
      </div>

      <!-- Desktop navigation -->
      <nav class="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
        <a href="/" class="px-4 py-1.5 rounded-full !text-gray-400 !border-none text-xs font-medium hover:!text-white border flex items-center gap-2 transition-colors"
                    :class="{'!bg-white/10 !border-white/10 !text-white': (page=='home')}">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          Dashboard
        </a>
        <a href="/watchlist" class="px-4 py-1.5 rounded-full !text-gray-400 !border-none text-xs font-medium hover:!text-white border flex items-center gap-2 transition-colors"
                    :class="{'!bg-white/10 !border-white/10 !text-white': (page=='watchlist')}">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Watchlist
        </a>
        <a href="/deep" class="px-4 py-1.5 rounded-full !text-gray-400 !border-none text-xs font-medium hover:!text-white border flex items-center gap-2 transition-colors"
                    :class="{'!bg-white/10 !border-white/10 !text-white': (page=='deep')}">
          <span class="text-[10px] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-1 rounded font-bold">PRO</span>
          Deep Trade
        </a>
        <a href="/price" class="px-4 py-1.5 rounded-full !text-gray-400 !border-none text-xs font-medium hover:!text-white border flex items-center gap-2 transition-colors"
                    :class="{'!bg-white/10 !border-white/10 !text-white': (page=='price')}">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Price
        </a>
        <a href="/history" class="px-4 py-1.5 rounded-full !text-gray-400 !border-none text-xs font-medium hover:!text-white border flex items-center gap-2 transition-colors"
                    :class="{'!bg-white/10 !border-white/10 !text-white': (page=='history')}">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          History
        </a>

      </nav>


      <!-- USER PROFILE -->
        <div v-if="auth.user"
             class="relative" 
             @click="() => navigateTo('/profile')">
          <button
            class="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-1 pr-3 rounded-full border border-purple-500/40 hover:border-purple-400 transition-all duration-200"
          >
            <!-- Avatar Circle -->
            <div class="bg-gradient-to-br from-blue-500 to-purple-600 p-[2px] rounded-full">
              <div class="bg-gray-900 rounded-full w-8 h-8 flex items-center justify-center">
                <p class="uppercase text-white text-sm font-semibold">
                  {{ auth.user?.username?.slice(0, 2) }}
                </p>
              </div>
            </div>

            <!-- Username -->
            <span class="hidden sm:block text-sm font-semibold text-white/80">
              {{ auth.user.username }}
            </span>
          </button>
      </div>

      <!-- DESKTOP SIGN IN -->
      <button
        v-else
        class="!hidden md:!flex bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1.5 rounded-full text-white text-xs font-bold hover:opacity-90 transition-opacity items-center gap-1 shadow-lg shadow-blue-500/20"
        @click="()=>$emit('signInClicked')"
      >
        Sign In
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>


      <!-- Mobile hamburger only -->
      <button @click="isOpen = !isOpen" class="md:hidden flex items-center justify-center p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition">
        <svg v-if="!isOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Mobile menu dropdown -->
    <transition name="fade">
      <nav v-if="isOpen" class="md:hidden bg-black/90 border-t border-white/10 flex flex-col">
        <a href="/" class="block px-4 py-3 text-white text-sm font-medium border-b border-white/10">Dashboard</a>
        <a href="/watchlist" class="block px-4 py-3 text-gray-400 hover:text-white text-sm font-medium border-b border-white/10">Watchlist</a>
        <a href="/deep" class="block px-4 py-3 text-gray-400 hover:text-white text-sm font-medium border-b border-white/10">Deep Trade</a>
        <a href="/price" class="block px-4 py-3 text-gray-400 hover:text-white text-sm font-medium border-b border-white/10">Price</a>
        <a href="/history" class="block px-4 py-3 text-gray-400 hover:text-white text-sm font-medium border-b border-white/10">History</a>

        <!-- USER LOGGED IN -->
        <p
          v-if="auth.user"
          class="w-10 h-10 flex items-center justify-center
                rounded-full font-semibold text-white uppercase
                bg-gradient-to-br from-blue-500 to-purple-600
                shadow-md shadow-blue-500/20
                select-none cursor-pointer"
          @click="() => navigateTo('/profile')"
        >
          {{ auth.user?.username?.slice(0, 2) }}
        </p>

        <!-- NOT LOGGED IN -->
        <p
          v-else
          @click="() => $emit('signInClicked')"
          class="px-4 py-3 mt-2
                flex items-center justify-center gap-2
                text-white text-sm font-bold
                bg-gradient-to-r from-blue-500 to-purple-600
                rounded-xl shadow-lg shadow-blue-500/20
                hover:opacity-90 active:scale-[0.98]
                transition-all cursor-pointer select-none"
        >
          Sign In
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </p>

      </nav>
    </transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
const isOpen = ref(false)
const props = defineProps(['page'])
const auth = useAuth();
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
