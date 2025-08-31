<template>
  <DashboardTopList title="By 24h Volume" :items="items" :loading="pending" />
</template>

<script setup lang="ts">
const { rows, pending } = useAll24h()
const items = computed(() =>
  [...rows.value]
    .sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume))
    .slice(0, 5)
    .map((r) => ({
      symbol: r.symbol,
      value: '$' + Number(r.quoteVolume).toLocaleString(),
      label: `$${Number(r.lastPrice).toLocaleString()}`,
    })),
)
</script>
