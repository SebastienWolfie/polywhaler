<template>
  <div style="color: red; font-size: 24px">
    INDEX ROUTE WORKS page indexd
  </div>
</template>


<script setup>


useHead({
  title: "Polywhaler",
  link: [{ rel: 'icon', type: 'image/png', href: '/images/logo.svg' }],
  meta: [{ name: 'description', content: 'PolyWhaler analyzes Polymarket wallets on Polygon. Discover whale trades, wallet scores, performance metrics, risk profiles, and real on-chain trading activity.' }]
});


// onMounted(async() =>{
//   const { getLatestTrades } = usePolymarket();
//   const data = await getLatestTrades()
//   console.log('usePolymarket', data)
// })


</script>
