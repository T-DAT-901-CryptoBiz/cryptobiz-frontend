<template>
  <DashboardTopList title="Top Losers" :items="items" :loading="pending" />
</template>

<script setup lang="ts">
const { rows, pending } = useAll24h()
const items = computed(() =>
  [...rows.value]
    .sort((a, b) => Number(a.priceChangePercent) - Number(b.priceChangePercent))
    .slice(0, 5)
    .map((r) => ({
      symbol: r.symbol,
      value: `${Number(r.priceChangePercent).toFixed(2)}%`,
      valueClass: 'text-red-400',
      label: `$${Number(r.lastPrice).toLocaleString()}`,
    })),
)
</script>
