<template>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
    <UiStatCard title="24h High" :loading="pending" :value="fmt(n.highPrice)" />
    <UiStatCard title="24h Low" :loading="pending" :value="fmt(n.lowPrice)" />
    <UiStatCard title="Open Price" :loading="pending" :value="fmt(n.openPrice)" />
    <UiStatCard title="Close Price" :loading="pending" :value="fmt(n.prevClosePrice)" />
    <UiStatCard title="24h Base Vol" :loading="pending" :value="fmt(n.volume)" />
    <UiStatCard title="24h Quote Vol" :loading="pending" :value="fmt(n.quoteVolume)" />
  </div>
</template>

<script setup lang="ts">
import type { Ticker24h } from '~/types/binance'

const props = defineProps<{ ticker?: Partial<Ticker24h>; pending?: boolean }>()
const n = computed(() => props.ticker || {})
const fmt = (v?: string | number) => (v ? Number(v).toLocaleString() : '—')
</script>
