<template>
  <div style="color: red; font-size: 24px">
    INDEX ROUTE WORKS
  </div>
</template>


<script setup>
import { listenToUserStateChanged } from './apiss/authstate'

onMounted(() => {
  listenToUserStateChanged()
})

useHead({
  title: "Polywhaler",
  link: [{ rel: 'icon', type: 'image/png', href: '/images/logo.svg' }],
  meta: [{ name: 'description', content: 'PolyWhaler analyzes Polymarket wallets on Polygon. Discover whale trades, wallet scores, performance metrics, risk profiles, and real on-chain trading activity.' }]
});


</script>
