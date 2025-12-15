<template>
  <div v-if="totalItems" class="flex flex-col sm:flex-row justify-between items-center mt-6 text-xs text-gray-400 gap-4">

    <!-- Left: Info -->
    <div>
      Page {{ currentPage }} • Showing {{ startItem }}–{{ endItem }} of {{ totalItems }} trades
    </div>

    <!-- Right: Pagination -->
    <div class="flex gap-2 items-center">

      <!-- Previous -->
      <button
        class="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-40 flex items-center gap-1 transition-colors"
        :disabled="currentPage === 1"
        @click="goToPage(currentPage - 1)"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center gap-1">
        <button
          v-for="page in pages"
          :key="page"
          class="px-3 py-1 rounded transition-colors"
          :class="page === currentPage
            ? 'bg-white text-black font-bold'
            : 'border border-white/10 hover:bg-white/5'"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </div>

      <!-- Next -->
      <button
        class="px-3 py-1 rounded bg-white text-black font-bold hover:bg-gray-200 flex items-center gap-1 transition-colors disabled:opacity-40"
        :disabled="currentPage === totalPages"
        @click="goToPage(currentPage + 1)"
      >
        Next
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5l7 7-7 7" />
        </svg>
      </button>

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: { type: Number, required: true },
  pageSize: { type: Number, default: 20 },
  totalItems: { type: Number, required: true }
})

const emit = defineEmits(['pageChange'])

const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))

const pages = computed(() => {
  // Display limited pages, example: 1 2 3 4 5
  const max = 5
  let start = Math.max(1, props.currentPage - 2)
  let end = Math.min(totalPages.value, start + max - 1)

  if (end - start < max - 1) {
    start = Math.max(1, end - max + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const startItem = computed(() => (props.currentPage - 1) * props.pageSize + 1)
const endItem = computed(() =>
  Math.min(props.currentPage * props.pageSize, props.totalItems)
)

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  emit("pageChange", page)
}
</script>
