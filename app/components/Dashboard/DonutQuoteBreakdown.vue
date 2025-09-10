<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Quote Volume (24h)</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </header>

    <p class="text-xs text-white/60 mb-3">
      sum quoteVolume — <span v-if="!pending">${{ totalFmt }}</span>
      <span v-else class="inline-block h-3 w-16 rounded bg-white/10 animate-pulse align-middle" />
    </p>

    <!-- skeleton -->
    <ul v-if="pending" class="space-y-3">
      <li v-for="i in 5" :key="i" class="space-y-1.5">
        <div class="flex items-center justify-between text-sm">
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full bg-white/10"></span>
            <span class="h-4 w-16 rounded bg-white/10 animate-pulse"></span>
          </span>
          <span class="h-4 w-24 rounded bg-white/10 animate-pulse"></span>
        </div>
        <div class="h-2 rounded bg-white/10 overflow-hidden">
          <div class="h-full w-1/2 bg-white/20 animate-pulse"></div>
        </div>
      </li>
    </ul>

    <!-- list -->
    <ul v-else class="space-y-3">
      <li v-for="row in items" :key="row.label" class="space-y-1.5">
        <div class="flex items-center justify-between text-sm">
          <span class="inline-flex items-center gap-2">
            <span
                class="h-2.5 w-2.5 rounded-full"
                :style="{ backgroundColor: row.color }"
                aria-hidden="true"
            />
            <span class="font-medium">{{ row.label }}</span>
          </span>
          <span class="text-white/70 tabular-nums">
            ${{ row.valueFmt }} <span class="text-white/50">· {{ row.pct.toFixed(1) }}%</span>
          </span>
        </div>
        <div class="h-2 rounded bg-white/10 overflow-hidden">
          <div
              class="h-full rounded"
              :style="{ width: row.pct + '%', backgroundColor: row.color }"
              :aria-label="row.label + ' ' + row.pct.toFixed(1) + '%'"
          />
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { ExchangeInfo } from '~/types/binance'

const props = withDefaults(defineProps<{ top?: number; includeBtcEth?: boolean }>(), {
  top: 5,
  includeBtcEth: true, // mets false si tu ne veux QUE les stables
})

const { rows, pending } = useAll24h()
const { exchangeInfo } = useBinanceMarket()

/* ---- mapping symbol -> quote ---- */
const sym2Quote = ref<Record<string, string>>({})
onMounted(async () => {
  const r = await exchangeInfo()
  await r.refresh()
  const map: Record<string, string> = {}
  for (const s of (r.data.value?.symbols || []) as ExchangeInfo['symbols']) {
    map[s.symbol] = s.quoteAsset
  }
  sym2Quote.value = map
})

/* ---- whitelist de quotes autorisées ---- */
const STABLES = ['USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD'] as const
const ALLOWED = computed<Set<string>>(() => {
  const base = new Set<string>(STABLES as unknown as string[])
  if (props.includeBtcEth) {
    base.add('BTC')
    base.add('ETH')
  }
  return base
})

/* ---- couleurs ---- */
const colorMap: Record<string, string> = {
  USDT: '#22c55e',
  FDUSD: '#f59e0b',
  USDC: '#60a5fa',
  BUSD: '#fbbf24',
  TUSD: '#f97316',
  USD:  '#06b6d4',
  BTC:  '#a78bfa',
  ETH:  '#8b5cf6',
  OTHER: '#64748b',
}

/* ---- agrégation (en ne gardant QUE la whitelist) ---- */
const aggEntries = computed<[string, number][]>(() => {
  const agg: Record<string, number> = {}
  for (const r of rows.value as any[]) {
    const sym = r.symbol as string
    const q = sym2Quote.value[sym] || (sym.match(/USDT|FDUSD|USDC|BUSD|TUSD|USD|BTC|ETH$/)?.[0] ?? 'OTHER')
    const key = ALLOWED.value.has(q) ? q : 'OTHER'
    const v = Number(r.quoteVolume || 0) || 0
    agg[key] = (agg[key] || 0) + v
  }
  return Object.entries(agg).sort((a, b) => b[1] - a[1])
})

const total = computed(() => aggEntries.value.reduce((a, [, v]) => a + v, 0))
const totalFmt = computed(() => Math.round(total.value).toLocaleString())

/* ---- top N + OTHER ---- */
const items = computed(() => {
  const entries = aggEntries.value
  const top = entries.slice(0, props.top)
  const rest = entries.slice(props.top).reduce((a, [, v]) => a + v, 0)

  const merged = [...top]
  const idxOther = merged.findIndex(([l]) => l === 'OTHER')
  if (rest > 0) {
    if (idxOther >= 0) merged[idxOther][1] += rest
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
</script>
