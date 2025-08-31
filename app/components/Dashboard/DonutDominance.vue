<template>
  <ChartsDonut :data="data" :loading="pending">
    <template #title><h3 class="font-semibold">BTC Dominance (24h volume)</h3></template>
    <template #center>
      <div>
        <div class="text-2xl font-semibold tabular-nums">{{ pct.toFixed(1) }}%</div>
        <div class="text-xs text-white/60">of stable-quoted volume</div>
      </div>
    </template>
    <template #cta>
      <NuxtLink to="/asset/BTCUSDT" class="text-xs text-white/60 hover:text-white/90"
        >Voir BTC
      </NuxtLink>
    </template>
  </ChartsDonut>
</template>

<script setup lang="ts">
const { rows, pending } = useAll24h()
const { exchangeInfo } = useBinanceMarket()

const sym2Base = ref<Record<string, string>>({})
const sym2Quote = ref<Record<string, string>>({})
onMounted(async () => {
  const r = await exchangeInfo()
  await r.refresh()
  const b: Record<string, string> = {},
    q: Record<string, string> = {}
  r.data.value?.symbols?.forEach((s: any) => {
    b[s.symbol] = s.baseAsset
    q[s.symbol] = s.quoteAsset
  })
  sym2Base.value = b
  sym2Quote.value = q
})

const stable = new Set(['USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD'])

const btcVol = computed(() =>
  rows.value.reduce((acc, r) => {
    const base = sym2Base.value[r.symbol]
    const quote = sym2Quote.value[r.symbol]
    if (base === 'BTC' && stable.has(quote)) acc += Number(r.quoteVolume || 0)
    return acc
  }, 0),
)

const totalStable = computed(() =>
  rows.value.reduce((acc, r) => {
    const quote = sym2Quote.value[r.symbol]
    if (stable.has(quote)) acc += Number(r.quoteVolume || 0)
    return acc
  }, 0),
)

const pct = computed(() => {
  const t = totalStable.value || 1
  return (btcVol.value / t) * 100
})

const data = computed(() => [
  { label: 'BTC (stable quotes)', value: btcVol.value, color: '#f59e0b' },
  { label: 'Others', value: Math.max(0, totalStable.value - btcVol.value), color: '#3b82f6' },
])
</script>
