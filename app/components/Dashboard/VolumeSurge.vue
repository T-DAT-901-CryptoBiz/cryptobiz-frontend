<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Volume Surge (24h vs 7d avg)</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="flex items-center justify-between">
        <UiSkeletonLine class="w-40 h-4" />
        <UiSkeletonLine class="w-24 h-4" />
      </div>
    </div>

    <ul v-else class="divide-y divide-white/5">
      <li v-for="(r, i) in top" :key="r.symbol" class="py-2 flex items-center justify-between">
        <NuxtLink :to="`/asset/${r.symbol}`" class="font-medium hover:underline">
          {{ i + 1 }}. {{ r.symbol }}
        </NuxtLink>
        <span class="tabular-nums text-sm"
          >${{ Math.round(r.vol24).toLocaleString() }} • ×{{ r.ratio.toFixed(2) }}</span
        >
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { universe } = useSymbolsUniverse()
const top = ref<{ symbol: string; ratio: number; vol24: number }[]>([])
const loading = ref(true)

const { ticker24h } = useBinanceMarket()

onMounted(async () => {
  loading.value = true
  const res: { symbol: string; ratio: number; vol24: number }[] = []
  const bucket = universe.slice(0, 12)
  const tickers = await Promise.all(bucket.map((s) => ticker24h(s)))
  for (let i = 0; i < bucket.length; i++) {
    const sym = bucket[i]
    const t = tickers[i].data.value as any
    const vol24 = Number(t?.quoteVolume || 0)

    const { candles, refresh } = useKlines(sym, '1h', 24 * 7)
    await refresh()
    const qavg = candles.value.reduce((a, c) => a + c.close * c.volume, 0) / 7
    const ratio = qavg ? vol24 / qavg : 0
    res.push({ symbol: sym, ratio, vol24 })
  }
  top.value = res.sort((a, b) => b.ratio - a.ratio).slice(0, 5)
  loading.value = false
})
</script>
