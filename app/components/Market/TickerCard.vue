<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between">
      <h3 class="text-sm text-white/70 font-medium">{{ ticker?.symbol }}</h3>
      <span class="text-xs text-white/50">24h</span>
    </div>

    <div class="mt-3">
      <p class="text-2xl font-semibold tabular-nums">
        <span v-if="!pending">${{ Number(ticker?.lastPrice || 0).toLocaleString() }}</span>
        <span v-else class="opacity-50">—</span>
      </p>
      <p
        class="mt-1 text-sm font-medium"
        :class="Number(ticker?.priceChangePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'"
      >
        {{ Number(ticker?.priceChangePercent || 0).toFixed(2) }}%
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ symbol: string }>()
const { data: ticker, pending } = useTicker(props.symbol)
</script>
