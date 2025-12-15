<template>
    <div class="card-bg rounded-lg p-4 mb-3 hover:border-gray-600 transition-colors"
         @click="()=> navigateTo(`/trade/${trade.slug}`)">
        <div class="flex gap-3 mb-3">
        <img :src="trade.icon" class="w-10 h-10 rounded bg-blue-500 flex items-center justify-center text-white font-bold shrink-0" />

        <div class="flex-1">
            <h3 class="font-semibold text-sm leading-tight text-white mb-1">{{ trade.title }}</h3>
            <div class="flex items-center gap-2 text-[11px] text-gray-400">
            <span>{{ new Date(trade.startDate).format('MMM dd, hh:mm a') }}</span>
            <span class="w-1 h-1 bg-gray-600 rounded-full"></span>
            <a href="#" class="flex items-center hover:text-white transition-colors">
                View Market 
                <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
            </div>
        </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 mb-4">
        <span class="text-[11px] font-bold text-white">{{ trade.prediction }}</span>
        <span class="text-[11px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 text-gray-300">
            {{ formatMoney(trade.prob*100) }}% probability
        </span>
        
        <span v-for="(tag, i) in trade.tags" :key="i" class="text-[11px] bg-[#1e1b4b] px-1.5 py-0.5 rounded border border-indigo-900 text-indigo-300 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
            {{ tag.label }}
        </span>

        <div class="flex items-center text-[11px] text-gray-400 gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Expires {{ new Date(trade.endDate).addDays(26).format('MMM dd, hh:mm a') }}
        </div>

        <span v-if="trade.impact" :class="getImpactClasses(trade.impact)" class="px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
            <svg v-if="trade.impact === 'High Impact'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            <svg v-if="trade.impact === 'Medium Impact'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <svg v-if="trade.impact === 'Low Impact'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            {{ trade.impact }}
        </span>

        <span v-if="trade.insider" class="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0f233a] text-blue-400 border border-blue-900/50 flex items-center gap-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5 10 10 0 0 0-10 10A10 10 0 0 0 12 2z"/></svg>
            Insider: {{ trade.insider }}
        </span>
        </div>

        <div class="bg-[#050505] rounded-lg p-3 flex justify-between items-center mb-3 border border-white/10">
        <div :class="[isBuy(trade.type) ? 'text-green-500' : 'text-red-500', 'flex items-center font-bold text-sm']">
            <svg v-if="isBuy(trade.type)" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            <svg v-else class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
            {{ trade.type }}
        </div>
        <div class="text-right">
            <div class="text-white font-bold text-lg leading-none">${{ formatMoney(trade.amount) }}</div>
            <div class="text-[11px] text-gray-500 mt-0.5">{{ trade.shares.toFixed(2) }}</div>
        </div>
        </div>

        <div class="flex items-center gap-2">
        <div :class="[trade.avatarColor, 'w-6 h-6 rounded-full flex items-center justify-center']">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <span class="text-[11px] text-gray-400">Trader: <span class="text-white font-medium">{{ trade.trader }}</span></span>
        </div>
    </div>
</template>


<script setup>
import Date from '../../utils/Date';

    const props = defineProps(['trade'])


    // --- HELPERS ---
    const getImpactClasses = (type) => {
    if (type === 'High Impact') return "bg-[#451a1a] text-red-500 border border-red-900/50";
    if (type === 'Medium Impact') return "bg-[#422e11] text-yellow-500 border border-yellow-900/50";
    if (type === 'Low Impact') return "bg-[#172554] text-blue-500 border border-blue-900/50";
    return "";
    }


    const isBuy = (type) => type === 'BUY'
    console.log(props.trade?.slug, isBuy(props.trade?.type))
</script>