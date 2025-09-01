<template>
  <DashboardTopList title="Most Volatile (24h %)" :items="items" :loading="pending" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAll24h } from '~/composables/useAll24h'

const { rows, pending } = useAll24h()
const items = computed(() =>
  [...rows.value]
    .sort((a, b) => Math.abs(Number(b.priceChangePercent)) - Math.abs(Number(a.priceChangePercent)))
    .slice(0, 5)
    .map((r) => ({
      symbol: r.symbol,
      value: `${Number(r.priceChangePercent).toFixed(2)}%`,
      valueClass: Number(r.priceChangePercent) >= 0 ? 'text-green-400' : 'text-red-400',
      label: `$${Number(r.lastPrice).toLocaleString()}`,
    })),
)
</script>
