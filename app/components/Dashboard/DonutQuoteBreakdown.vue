<template>
  <ChartsDonut :data="donutData" :loading="pending">
    <template #title><h3 class="font-semibold">Quote Volume (24h)</h3></template>
    <template #center-sub>sum quoteVolume</template>
    <template #cta>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </template>
  </ChartsDonut>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { ExchangeInfo } from '~/types/binance'

const props = withDefaults(defineProps<{ top?: number }>(), { top: 5 })
const { rows, pending } = useAll24h()
const { exchangeInfo } = useBinanceMarket()

const sym2Quote = ref<Record<string, string>>({})
onMounted(async () => {
  const r = await exchangeInfo()
  await r.refresh()
  if (r.data.value?.symbols) {
    const map: Record<string, string> = {}
    type Sym = ExchangeInfo['symbols'][number]
    r.data.value.symbols.forEach((s: Sym) => {
      map[s.symbol] = s.quoteAsset
    })
    sym2Quote.value = map
  }
})

const colorMap: Record<string, string> = {
  USDT: '#22c55e',
  FDUSD: '#f59e0b',
  USDC: '#60a5fa',
  BUSD: '#fbbf24',
  TUSD: '#f97316',
  BTC: '#a78bfa',
  ETH: '#8b5cf6',
  OTHER: '#64748b',
}

const donutData = computed(() => {
  const agg: Record<string, number> = {}
  rows.value.forEach((r) => {
    const q =
      sym2Quote.value[r.symbol] ||
      (r.symbol.match(/USDT|FDUSD|USDC|BUSD|TUSD|BTC|ETH$/)?.[0] ?? 'OTHER')
    agg[q] = (agg[q] || 0) + (Number(r.quoteVolume || 0) || 0)
  })
  const entries = Object.entries(agg).sort((a, b) => b[1] - a[1])
  const top = entries.slice(0, props.top).map(([label, value]) => ({ label, value }))
  const rest = entries.slice(props.top).reduce((a, [, v]) => a + (v || 0), 0)

  const idx = top.findIndex((d) => d.label === 'OTHER')
  if (rest > 0) {
    if (idx >= 0) top[idx].value += rest
    else top.push({ label: 'OTHER', value: rest })
  }

  return top.map((d) => ({ ...d, color: colorMap[d.label] || colorMap.OTHER }))
})
</script>
