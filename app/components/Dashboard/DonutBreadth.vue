<template>
  <ChartsDonut :data="donutData" :loading="pending">
    <template #title><h3 class="font-semibold">Market Breadth</h3></template>
    <template #center-sub>pairs count</template>
    <template #cta>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </template>
  </ChartsDonut>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAll24h } from '~/composables/useAll24h'

const { rows, pending } = useAll24h()

const donutData = computed(() => {
  const adv = rows.value.filter((r) => Number(r.priceChangePercent) > 0).length
  const dec = rows.value.filter((r) => Number(r.priceChangePercent) < 0).length
  const flat = rows.value.length - adv - dec
  return [
    { label: 'Advancers', value: adv, color: '#22c55e' },
    { label: 'Decliners', value: dec, color: '#ef4444' },
    { label: 'Flat', value: flat, color: '#94a3b8' },
  ]
})
</script>
