<template>
  <div>
    <!-- Here nuxt will replace page content -->
    <slot></slot>
  </div>
</template>

<script setup>

useHead({
  title: "Polywhaler",
  link: [{ rel: 'icon', type: 'image/png', href: '/images/logo.svg' }],
  meta: [{ name: 'description', content: 'PolyWhaler analyzes Polymarket wallets on Polygon. Discover whale trades, wallet scores, performance metrics, risk profiles, and real on-chain trading activity.' }]
});
</script>
