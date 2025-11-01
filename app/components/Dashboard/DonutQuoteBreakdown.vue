<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold">Quote Volume</h3>
        <p class="text-xs text-white/60 mt-0.5">24h Breakdown</p>
      </div>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90 transition-colors">
        Markets →
      </NuxtLink>
    </header>

    <!-- Total Volume Display -->
    <div class="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
      <div class="text-xs text-white/60 mb-1">Total 24h Volume</div>
      <div class="text-2xl font-bold tabular-nums">
        <span v-if="!pending">${{ totalFmt }}</span>
        <span v-else class="inline-block h-7 w-32 rounded bg-white/10 animate-pulse align-middle" />
      </div>
    </div>

    <div v-if="pending" class="space-y-3">
      <div class="h-2 rounded-full bg-white/10 animate-pulse"></div>
      <div v-for="i in props.top" :key="i" class="space-y-2">
        <div class="h-12 rounded-lg bg-white/10 animate-pulse"></div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <!-- Segmented Bar -->
      <div
        class="h-3 w-full overflow-hidden rounded-full bg-white/10 flex transition-all duration-700"
        aria-label="Quote distribution"
      >
        <div
          v-for="seg in segments"
          :key="seg.label"
          class="h-full transition-all duration-700 ease-out"
          :style="{
            width: seg.pct + '%',
            backgroundColor: seg.color,
          }"
          :title="`${seg.label} • ${seg.pct.toFixed(1)}% • $${seg.valueFmt}`"
        />
      </div>

      <!-- Quote Items -->
      <div class="space-y-2">
        <div
          v-for="row in items"
          :key="row.label"
          class="rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-colors"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="h-3 w-3 rounded-full flex-shrink-0"
                :style="{ backgroundColor: row.color }"
              />
              <div class="min-w-0">
                <div class="font-semibold text-sm truncate">{{ row.label }}</div>
                <div class="text-xs text-white/60">{{ row.description }}</div>
              </div>
            </div>

            <div class="text-right flex-shrink-0 ml-2">
              <div class="font-semibold tabular-nums text-sm">${{ row.valueFmt }}</div>
              <div class="text-xs text-white/60">{{ row.pct.toFixed(1) }}%</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :style="{ width: row.pct + '%', backgroundColor: row.color }"
              :aria-label="`${row.label} ${row.pct.toFixed(1)}%`"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { ExchangeInfo } from '~/types/binance'

const props = withDefaults(defineProps<{ top?: number }>(), { top: 5 })

const { rows, pending, refresh } = useAll24h()
const { exchangeInfo } = useBinanceMarket()

const sym2Quote = ref<Record<string, string>>({})

let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  const r = await exchangeInfo()
  await r.refresh()
  const map: Record<string, string> = {}
  type Sym = ExchangeInfo['symbols'][number]
  r.data.value?.symbols?.forEach((s: Sym) => (map[s.symbol] = s.quoteAsset))
  sym2Quote.value = map

  // Refresh data every 30 seconds
  if (import.meta.client) {
    refreshInterval = setInterval(() => {
      void refresh()
    }, 30000)
  }
})

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

const colorMap: Record<string, string> = {
  USDT: '#22c55e',
  FDUSD: '#f59e0b',
  USDC: '#3b82f6',
  BUSD: '#fbbf24',
  TUSD: '#f97316',
  USD: '#86efac',
  BTC: '#a78bfa',
  ETH: '#8b5cf6',
  OTHER: '#64748b',
}

const descriptionMap: Record<string, string> = {
  USDT: 'Tether',
  FDUSD: 'First Digital USD',
  USDC: 'USD Coin',
  BUSD: 'Binance USD',
  TUSD: 'TrueUSD',
  USD: 'US Dollar',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  OTHER: 'Other currencies',
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
const totalFmt = computed(() =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(total.value),
)

const items = computed(() => {
  const entries = aggEntries.value
  const top = entries.slice(0, props.top)
  const rest = entries.slice(props.top).reduce((a, [, v]) => a + v, 0)

  const merged: [string, number][] = [...top]
  const idx = merged.findIndex(([l]) => l === 'OTHER')
  if (rest > 0) {
    if (idx >= 0) merged[idx][1] += rest
    else merged.push(['OTHER', rest])
  }

  return merged.map(([label, value]) => {
    const pct = total.value > 0 ? (value / total.value) * 100 : 0
    return {
      label,
      description: descriptionMap[label] || 'Other',
      value,
      valueFmt: new Intl.NumberFormat(undefined, {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value),
      pct,
      color: colorMap[label] || colorMap.OTHER,
    }
  })
})

const segments = computed(() =>
  items.value.map((d) => ({
    label: d.label,
    pct: d.pct,
    color: d.color,
    valueFmt: d.valueFmt,
  })),
)
</script>
