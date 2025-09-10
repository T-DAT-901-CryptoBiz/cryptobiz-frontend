<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Quote Volume (24h)</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </header>

    <p class="text-xs text-white/60 mb-3">
      sum quoteVolume —
      <span v-if="!pending">${{ totalFmt }}</span>
      <span v-else class="inline-block h-3 w-16 rounded bg-white/10 animate-pulse align-middle" />
    </p>

    <div v-if="pending" class="space-y-3">
      <div class="h-2 rounded bg-white/10 animate-pulse"></div>
      <div v-for="i in 5" :key="i" class="space-y-1.5">
        <div class="flex items-center justify-between text-sm">
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-white/10"></span>
            <span class="h-4 w-16 rounded bg-white/10 animate-pulse"></span>
          </span>
          <span class="h-4 w-24 rounded bg-white/10 animate-pulse"></span>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div
        class="h-2 w-full overflow-hidden rounded bg-white/10 flex"
        aria-label="Quote distribution"
      >
        <div
          v-for="seg in segments"
          :key="seg.label"
          class="h-full"
          :style="{
            width: seg.pct + '%',
            backgroundColor: seg.color,
          }"
          :title="`${seg.label} • ${seg.pct.toFixed(1)}%`"
        />
      </div>

      <ul class="space-y-3">
        <li v-for="row in items" :key="row.label" class="space-y-1.5">
          <div class="flex items-center justify-between text-sm">
            <span class="inline-flex items-center gap-2 min-w-0">
              <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: row.color }" />
              <span class="font-medium truncate">{{ row.label }}</span>
            </span>

            <span class="text-white/70 tabular-nums">
              ${{ row.valueFmt }}
              <span class="text-white/50">· {{ row.pct.toFixed(1) }}%</span>
            </span>
          </div>

          <div class="h-1.5 rounded bg-white/10 overflow-hidden">
            <div
              class="h-full rounded"
              :style="{ width: row.pct + '%', backgroundColor: row.color }"
              :aria-label="row.label + ' ' + row.pct.toFixed(1) + '%'"
            />
          </div>
        </li>
      </ul>
    </div>
  </section>
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
    const sym = (r as any).symbol as string
    const qRaw =
      sym2Quote.value[sym] || (sym.match(/USDT|FDUSD|USDC|BUSD|TUSD|USD|BTC|ETH$/)?.[0] ?? 'OTHER')
    const quote = HIGHLIGHTS.has(qRaw) ? qRaw : 'OTHER'
    const v = Number((r as any).quoteVolume || 0) || 0
    agg[quote] = (agg[quote] || 0) + v
  }
  return Object.entries(agg).sort((a, b) => b[1] - a[1])
})

const total = computed(() => aggEntries.value.reduce((a, [, v]) => a + v, 0))
const totalFmt = computed(() => Math.round(total.value).toLocaleString())

const items = computed(() => {
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
      valueFmt: Math.round(value).toLocaleString(),
      pct,
      color: colorMap[label] || colorMap.OTHER,
    }
  })
})

const segments = computed(() =>
  items.value.map((d) => ({ label: d.label, pct: d.pct, color: d.color })),
)
</script>
