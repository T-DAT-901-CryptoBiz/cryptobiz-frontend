<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-semibold">Market Breadth (24h)</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </div>

    <template v-if="pending">
      <ui-skeleton-block class="h-6" />
      <div class="flex justify-between text-xs text-white/50 mt-2">
        <ui-skeleton-line class="w-20 h-4" />
        <ui-skeleton-line class="w-20 h-4" />
      </div>
    </template>
    <template v-else>
      <div class="h-3 w-full rounded-full bg-white/10 overflow-hidden">
        <div class="h-full bg-green-500" :style="{ width: pctAdv + '%' }"></div>
      </div>
      <div class="flex justify-between text-xs text-white/70 mt-2">
        <span>Advancers: {{ adv }}</span>
        <span>Decliners: {{ dec }}</span>
        <span>Flat: {{ flat }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { rows, pending } = useAll24h()
const adv = computed(() => rows.value.filter((r) => Number(r.priceChangePercent) > 0).length)
const dec = computed(() => rows.value.filter((r) => Number(r.priceChangePercent) < 0).length)
const flat = computed(() => rows.value.length - adv.value - dec.value)
const pctAdv = computed(() =>
  rows.value.length ? Math.round((adv.value / rows.value.length) * 100) : 0,
)
</script>
