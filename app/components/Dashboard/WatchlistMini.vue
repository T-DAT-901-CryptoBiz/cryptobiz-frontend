<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Your Watchlist</h3>
      <NuxtLink to="/watchlist" class="text-xs text-white/60 hover:text-white/90">Manage</NuxtLink>
    </div>

    <div v-if="!list.length" class="text-sm text-white/60">Add some pairs from Markets.</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="s in list" :key="s" class="rounded-xl bg-white/5 p-3">
        <div class="flex items-center justify-between">
          <NuxtLink :to="`/asset/${s}`" class="font-medium hover:underline">{{ s }}</NuxtLink>
          <span class="text-xs text-white/50">24h</span>
        </div>
        <MarketTickerCard :symbol="s" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { list } = useWatchlist()
</script>
