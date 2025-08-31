<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Quote Volume Breakdown (24h)</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </div>

    <div v-if="pending || !groups.length" class="space-y-2">
      <UiSkeletonLine v-for="i in 6" :key="i" class="h-5" />
    </div>

    <div v-else class="space-y-2">
      <div v-for="g in groups" :key="g.q">
        <div class="flex justify-between text-sm">
          <span class="font-medium">{{ g.q }}</span>
          <span class="tabular-nums"
            >${{ Math.round(g.v).toLocaleString() }} • {{ g.pct.toFixed(1) }}%</span
          >
        </div>
        <div class="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
          <div class="h-full bg-white/50" :style="{ width: g.pct + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { rows, pending } = useAll24h()
const { exchangeInfo } = useBinanceMarket()

const sym2Quote = ref<Record<string, string>>({})
onMounted(async () => {
  const r = await exchangeInfo()
  await r.refresh()
  const info = r.data.value
  const map: Record<string, string> = {}
  if (info?.symbols?.length) {
    for (const s of info.symbols) map[s.symbol] = s.quoteAsset
  }
  sym2Quote.value = map
})

const groups = computed(() => {
  const agg: Record<string, number> = {}
  for (const r of rows.value) {
    const q =
      sym2Quote.value[r.symbol] ||
      (r.symbol.match(/USDT|FDUSD|USDC|BUSD|TUSD|BTC|ETH$/)?.[0] ?? 'OTHER')
    agg[q] = (agg[q] || 0) + Number(r.quoteVolume || 0)
  }
  const total = Object.values(agg).reduce((a, b) => a + b, 0) || 1
  return Object.entries(agg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([q, v]) => ({ q, v, pct: (v / total) * 100 }))
})
</script>
