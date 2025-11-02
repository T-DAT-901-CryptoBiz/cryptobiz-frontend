<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">Quote Volume (24h)</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </header>

    <div v-if="pending" class="space-y-3">
      <div class="h-7 w-28 rounded bg-white/10 animate-pulse"></div>
      <div v-for="i in 6" :key="i" class="space-y-2">
        <div class="h-4 w-full rounded bg-white/10 animate-pulse"></div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-end justify-between">
        <div>
          <div class="text-2xl font-semibold tabular-nums">${{ totalFmt }}</div>
          <div class="text-xs text-white/60">Total quote volume (24h)</div>
        </div>
      </div>

      <div class="space-y-3">
        <div v-for="item in displayItems" :key="item.label" class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="inline-flex items-center gap-2 min-w-0 flex-1">
              <span
                class="h-2.5 w-2.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: item.color }"
              />
              <span class="font-medium truncate">{{ item.label }}</span>
            </span>
            <span class="tabular-nums text-white/70 ml-2">
              ${{ item.valueFmt }}
              <span class="text-white/50 text-xs ml-1">({{ item.pct.toFixed(1) }}%)</span>
            </span>
          </div>

          <div class="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              :style="{
                width: item.pct + '%',
                backgroundColor: item.color,
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { ExchangeInfo } from '~/types/binance'

const props = withDefaults(defineProps<{ top?: number }>(), { top: 6 })

const { rows, pending } = useAll24h()
const { exchangeInfo } = useBinanceMarket()

const sym2Quote = ref<Record<string, string>>({})
onMounted(async () => {
  const r = await exchangeInfo()
  await r.refresh()
  const map: Record<string, string> = {}
  type Sym = ExchangeInfo['symbols'][number]
  r.data.value?.symbols?.forEach((s: Sym) => (map[s.symbol] = s.quoteAsset))
  sym2Quote.value = map
})

const colorMap: Record<string, string> = {
  USDT: '#22c55e',
  FDUSD: '#f59e0b',
  USDC: '#60a5fa',
  BUSD: '#fbbf24',
  TUSD: '#f97316',
  USD: '#86efac',
  BTC: '#a78bfa',
  ETH: '#8b5cf6',
  OTHER: '#64748b',
}

const HIGHLIGHTS = new Set(['USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD', 'BTC', 'ETH'])

const aggEntries = computed<[string, number][]>(() => {
  const agg: Record<string, number> = {}
  for (const r of rows.value) {
    const sym = r.symbol
    const qRaw =
      sym2Quote.value[sym] || (sym.match(/USDT|FDUSD|USDC|BUSD|TUSD|USD|BTC|ETH$/)?.[0] ?? 'OTHER')
    const quote = HIGHLIGHTS.has(qRaw) ? qRaw : 'OTHER'
    const v = Number(r.quoteVolume || 0) || 0
    agg[quote] = (agg[quote] || 0) + v
  }
  return Object.entries(agg).sort((a, b) => b[1] - a[1])
})

const total = computed(() => aggEntries.value.reduce((a, [, v]) => a + v, 0))
const totalFmt = computed(() => {
  const t = total.value
  if (t >= 1e12) return (t / 1e12).toFixed(2) + 'T'
  if (t >= 1e9) return (t / 1e9).toFixed(2) + 'B'
  if (t >= 1e6) return (t / 1e6).toFixed(2) + 'M'
  return Math.round(t).toLocaleString()
})

const displayItems = computed(() => {
  const entries = aggEntries.value
  const top = entries.slice(0, props.top)
  const rest = entries.slice(props.top).reduce((a, [, v]) => a + v, 0)

  const merged = [...top]
  const idx = merged.findIndex(([l]) => l === 'OTHER')
  if (rest > 0) {
    if (idx >= 0) merged[idx][1] += rest
    else merged.push(['OTHER', rest])
  }

  return merged.map(([label, value]) => {
    const pct = total.value > 0 ? (value / total.value) * 100 : 0
    return {
      label,
      value,
      valueFmt: (() => {
        const v = value
        if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T'
        if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
        if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
        return Math.round(v).toLocaleString()
      })(),
      pct,
      color: colorMap[label] || colorMap.OTHER,
    }
  })
})
</script>
