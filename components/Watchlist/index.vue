<script setup>
import {
  create as saveWatchlist,
  getAllForUser as getAllWatchlistForUser,
  deleteWatchlist
} from '../../apiss/watchlist'

const searchQuery = ref("")
const auth = useAuth()

const suggestedWhales = ref([])
const watchlist = ref([])

// 🔹 loading states
const loadingWhales = ref(true)
const loadingWatchlist = ref(false)
const loadError = ref(null)

onMounted(async () => {
  try {
    loadingWhales.value = true

    if (auth.value.user) {
      await initializeWathlist()
    }

    const { getAllWhales } = usePolymarket()
    const data = await getAllWhales(10, 0)
    // const data = await useAsyncData(`whales`, () => getAllWhales(10, 0), {
    //   transform: (data) => JSON.parse(JSON.stringify(data))
    // })

    suggestedWhales.value = data.slice(0, 6)
  } catch (err) {
    console.error(err)
    loadError.value = 'Failed to load whales'
  } finally {
    loadingWhales.value = false
  }
})

watch(() => auth.value.user, async () => {
  if (auth.value.user) {
    await initializeWathlist()
  } else {
    watchlist.value = []
  }
})

async function initializeWathlist() {
  try {
    loadingWatchlist.value = true
    watchlist.value = await getAllWatchlistForUser(auth.value.user.id)
  } finally {
    loadingWatchlist.value = false
  }
}

const filteredWhales = computed(() => {
  if (!searchQuery.value.trim()) return suggestedWhales.value

  const q = searchQuery.value.toLowerCase()
  return suggestedWhales.value.filter(w =>
    w.trader?.toLowerCase().includes(q) ||
    w.address?.toLowerCase().includes(q)
  )
})

async function followButtonClicked(item) {
  if (!auth.value.user) {
    auth.value.showNoAuthModal()
    return
  }

  await saveWatchlist(auth.value.user.id, item.address, item.trader)
  watchlist.value.push(item)
}

async function unfollowButtonClicked(item) {
  if (!auth.value.user) {
    auth.value.showNoAuthModal()
    return
  }

  await deleteWatchlist(auth.value.user.id, item.address)
  watchlist.value = watchlist.value.filter(
    w => w.address !== item.address
  )
}

const isFollowed = computed(() => {
  return (address) => {
    return watchlist.value.some(item => item.address === address)
  }
})
</script>



<template>
  <div class="min-h-screen bg-black text-gray-200 font-sans pb-20">

    <div v-if="loadingWhales" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div class="flex flex-col items-center">
        <div class="w-10 h-10 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin mb-3"></div>
        <p class="text-xs text-gray-400">Loading whales…</p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 pt-10">

      <div
        class="card-bg rounded-lg p-5 mb-8 bg-indigo-900/20 border-indigo-700/50 border flex flex-col items-center text-center">
        <div class="flex items-center gap-3 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4l3 3" />
          </svg>
          <span class="text-white font-semibold text-sm">Watchlist Only Saved Locally</span>
        </div>
        <p class="text-gray-400 text-xs mb-4">Your watchlist is currently stored on this device only. Sign in to sync
          your watchlist across all your devices and browsers.</p>
        <button
          class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Sign in to Enable Sync
        </button>
      </div>

      <h2 class="text-white font-bold text-lg mb-4 flex justify-between items-center">
        Suggested Whales to Follow
        <span class="text-xs text-gray-500 font-normal border border-white/10 px-2 py-0.5 rounded-full">Based on recent
          activity</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div v-for="whale in filteredWhales" :key="whale.address"
          class="card-bg rounded-lg p-4 border border-white/10 hover:border-purple-600 transition-all">
          <div class="flex items-center gap-3 mb-4">
            <div :class="[whale.avatarColor, 'w-8 h-8 rounded-full flex items-center justify-center shrink-0']">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white opacity-70" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div class="cursor-pointer" @click="() => navigateTo(`/whale/${whale.address}`)">
              <div class="text-white hover:text-purple-600 font-semibold text-sm leading-none">{{ whale.trader }}</div>
              <div class="text-gray-500 hover:text-purple-600 text-xs mt-0.5">{{ whale?.address?.slice(0, 7) }}...{{
                whale?.address?.slice(whale?.address?.length - 7) }}</div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2 text-xs mb-4 border-t border-white/10 pt-3">
            <div>
              <div class="text-gray-500">Recent Trades</div>
              <div class="text-white font-bold">{{ whale.trades }}</div>
            </div>
            <div>
              <div class="text-gray-500">Volume</div>
              <div class="text-white font-bold">{{ whale.volume }}</div>
            </div>
            <div>
              <div class="text-gray-500">Last Trade</div>
              <div class="text-white font-bold">{{ whale.lastTrade }}</div>
            </div>
          </div>

          <button
            class="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold hover:opacity-90 transition-opacity"
            @click="() => unfollowButtonClicked(whale)" v-if="isFollowed(whale.address)">
            - Unfollow
          </button>

          <button
            class="w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold hover:opacity-90 transition-opacity"
            @click="() => followButtonClicked(whale)" v-else>
            + Follow
          </button>
        </div>
      </div>

      <h2 class="text-white font-bold text-lg mb-4">Follow a Whale</h2>
      <div class="card-bg rounded-lg p-4 mb-6 border border-white/10">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 7a2 2 0 012 2v4a2 2 0 01-2 2h-2m-2-4h-2m2 0V7m2 0v12" />
              </svg>
            </div>
            <input v-model="searchQuery" type="text" placeholder="Search trader or wallet (0x1234...)" class="bg-black border border-white/10 text-gray-300 text-sm rounded-lg block w-full pl-10 p-2.5
                    focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-600" />
          </div>
          <button
            class="px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 transition-colors">
            + Follow
          </button>
        </div>
        <p class="text-gray-500 text-xs mt-2">Find whale addresses from the main tracker and add them here to follow
          their activity</p>
      </div>

    </div>

  </div>
</template>