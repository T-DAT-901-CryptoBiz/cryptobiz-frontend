<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">BTC Dominance (24h volume)</h3>
      <NuxtLink to="/asset/BTCUSDT" class="text-xs text-white/60 hover:text-white/90"
        >See BTC</NuxtLink
      >
    </header>

    <div v-if="pending" class="space-y-3">
      <div class="h-7 w-28 rounded bg-white/10 animate-pulse"></div>
      <div class="h-12 rounded bg-white/10 animate-pulse"></div>
      <div class="h-4 w-1/2 rounded bg-white/10 animate-pulse"></div>
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-end justify-between">
        <div>
          <div class="text-2xl font-semibold tabular-nums">{{ pct.toFixed(1) }}%</div>
          <div class="text-xs text-white/60">of stable-quoted volume</div>
        </div>
        <div class="text-xs text-white/60 text-right">
          <div>Total: ${{ totalStableFmt }}</div>
          <div class="mt-1">BTC pairs: {{ btcPairsCount }}</div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colors.btc }" />
              <span class="font-medium">BTC</span>
            </span>
            <span class="tabular-nums text-white/70">
              ${{ btcVolFmt }}
              <span class="text-white/50 text-xs ml-1">({{ pct.toFixed(1) }}%)</span>
            </span>
          </div>
          <div class="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              :style="{
                width: pctClamped + '%',
                backgroundColor: colors.btc,
              }"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colors.others }" />
              <span class="font-medium">Others</span>
            </span>
            <span class="tabular-nums text-white/70">
              ${{ othersVolFmt }}
              <span class="text-white/50 text-xs ml-1">({{ (100 - pctClamped).toFixed(1) }}%)</span>
            </span>
          </div>
          <div class="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              :style="{
                width: 100 - pctClamped + '%',
                backgroundColor: colors.others,
              }"
            />
          </div>
        </div>
      </div>

      <div v-if="btcByQuote.length > 0" class="pt-3 border-t border-white/10">
        <div class="text-xs text-white/60 mb-2">BTC volume by stable:</div>
        <div class="space-y-2">
          <div
            v-for="item in btcByQuote"
            :key="item.quote"
            class="flex items-center justify-between text-xs"
          >
            <span class="inline-flex items-center gap-1.5">
              <span
                class="h-2 w-2 rounded-full flex-shrink-0"
                :style="{ backgroundColor: item.color }"
              />
              <span class="font-medium">{{ item.quote }}</span>
            </span>
            <span class="tabular-nums text-white/70">
              ${{ item.valueFmt }}
              <span class="text-white/50 text-xs ml-1">({{ item.pct.toFixed(1) }}%)</span>
            </span>
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

const { rows, pending } = useAll24h()
const { exchangeInfo } = useBinanceMarket()

const sym2Base = ref<Record<string, string>>({})
const sym2Quote = ref<Record<string, string>>({})

onMounted(async () => {
  const r = await exchangeInfo()
  await r.refresh()
  const b: Record<string, string> = {}
  const q: Record<string, string> = {}
  type Sym = ExchangeInfo['symbols'][number]
  r.data.value?.symbols?.forEach((s: Sym) => {
    b[s.symbol] = s.baseAsset
    q[s.symbol] = s.quoteAsset
  })
  sym2Base.value = b
  sym2Quote.value = q
})

const stable = new Set(['USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD'])
const pctClamped = computed(() => Math.max(0, Math.min(100, pct.value)))

const quoteColors: Record<string, string> = {
  USDT: '#22c55e',
  FDUSD: '#f59e0b',
  USDC: '#60a5fa',
  BUSD: '#fbbf24',
  TUSD: '#f97316',
  USD: '#86efac',
}

const btcVol = computed(() =>
  rows.value.reduce((acc, r) => {
    const base = sym2Base.value[r.symbol]
    const quote = sym2Quote.value[r.symbol]
    if (base === 'BTC' && stable.has(quote)) acc += Number(r.quoteVolume || 0)
    return acc
  }, 0),
)

const btcByQuoteRaw = computed(() => {
  const agg: Record<string, number> = {}
  rows.value.forEach((r) => {
    const base = sym2Base.value[r.symbol]
    const quote = sym2Quote.value[r.symbol]
    if (base === 'BTC' && stable.has(quote)) {
      const vol = Number(r.quoteVolume || 0)
      agg[quote] = (agg[quote] || 0) + vol
    }
  })
  return Object.entries(agg)
    .map(([quote, value]) => ({
      quote,
      value,
      color: quoteColors[quote] || '#64748b',
    }))
    .sort((a, b) => b.value - a.value)
})

const btcByQuote = computed(() => {
  const total = btcVol.value
  if (total === 0) return []
  return btcByQuoteRaw.value.map((item) => ({
    ...item,
    pct: (item.value / total) * 100,
    valueFmt: (() => {
      const v = item.value
      if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T'
      if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
      if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
      return Math.round(v).toLocaleString()
    })(),
  }))
})

const btcPairsCount = computed(() => {
  const pairs = new Set<string>()
  rows.value.forEach((r) => {
    const base = sym2Base.value[r.symbol]
    const quote = sym2Quote.value[r.symbol]
    if (base === 'BTC' && stable.has(quote)) {
      pairs.add(r.symbol)
    }
  })
  return pairs.size
})

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

const totalStableFmt = computed(() => {
  const t = totalStable.value
  if (t >= 1e12) return (t / 1e12).toFixed(2) + 'T'
  if (t >= 1e9) return (t / 1e9).toFixed(2) + 'B'
  if (t >= 1e6) return (t / 1e6).toFixed(2) + 'M'
  return Math.round(t).toLocaleString()
})

const btcVolFmt = computed(() => {
  const v = btcVol.value
  if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T'
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  return Math.round(v).toLocaleString()
})

const othersVolFmt = computed(() => {
  const v = Math.max(0, totalStable.value - btcVol.value)
  if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T'
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  return Math.round(v).toLocaleString()
})

const colors = {
  btc: '#f59e0b',
  others: '#3b82f6',
}
</script>
