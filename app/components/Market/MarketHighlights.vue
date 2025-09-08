<template>
  <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-white/80">Popular</span>
      </div>

      <div v-if="anyPending" class="space-y-3">
        <div v-for="i in 3" :key="'p' + i" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
            <div class="h-3 w-14 rounded bg-white/10 animate-pulse" />
          </div>
          <div class="flex flex-col items-end gap-1">
            <div class="h-3 w-16 rounded bg-white/10 animate-pulse" />
            <div class="h-3 w-10 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      <ul v-else class="space-y-3">
        <li v-for="r in popularRows" :key="r.symbol" class="flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <ui-coin-logo :asset="r.base" :size="20" />
            <div class="truncate text-sm">{{ r.base }}</div>
          </div>
          <div class="text-right">
            <div class="tabular-nums text-sm">${{ r.lastPriceFmt }}</div>
            <div
              :class="r.pct >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              class="text-xs tabular-nums"
            >
              {{ r.pctSign }}
            </div>
          </div>
        </li>
      </ul>
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-white/80">The + on the rise</span>
      </div>

      <div v-if="anyPending" class="space-y-3">
        <div v-for="i in 3" :key="'g' + i" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
            <div class="h-3 w-14 rounded bg-white/10 animate-pulse" />
          </div>
          <div class="flex flex-col items-end gap-1">
            <div class="h-3 w-16 rounded bg-white/10 animate-pulse" />
            <div class="h-3 w-10 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      <ul v-else class="space-y-3">
        <li v-for="r in topGainersRows" :key="r.symbol" class="flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <ui-coin-logo :asset="r.base" :size="20" />
            <div class="truncate text-sm">{{ r.base }}</div>
          </div>
          <div class="text-right">
            <div class="tabular-nums text-sm">${{ r.lastPriceFmt }}</div>
            <div class="text-emerald-400 text-xs tabular-nums">+{{ r.pctAbs }}%</div>
          </div>
        </li>
      </ul>
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-white/80">Best volume</span>
      </div>

      <div v-if="anyPending" class="space-y-3">
        <div v-for="i in 3" :key="'v' + i" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
            <div class="h-3 w-14 rounded bg-white/10 animate-pulse" />
          </div>
          <div class="flex flex-col items-end gap-1">
            <div class="h-3 w-16 rounded bg-white/10 animate-pulse" />
            <div class="h-3 w-10 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      <ul v-else class="space-y-3">
        <li v-for="r in topVolumeRows" :key="r.symbol" class="flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <ui-coin-logo :asset="r.base" :size="20" />
            <div class="truncate text-sm">{{ r.base }}</div>
          </div>
          <div class="text-right">
            <div class="tabular-nums text-sm">${{ r.quoteVolFmt }}</div>
            <div
              :class="r.pct >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              class="text-xs tabular-nums"
            >
              {{ r.pctSign }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import type { Ticker24h } from '~/types/binance'

const { rows, pending } = useAll24h()
const anyPending = computed(() => pending.value)

const SUFFIX = /(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/

type ViewRow = {
  symbol: string
  base: string
  lastPrice: number
  lastPriceFmt: string
  pct: number
  pctAbs: string
  pctSign: string
  quoteVol: number
  quoteVolFmt: string
  trades: number
}

function toNum(n: unknown, d = 0) {
  const v = Number(n)
  return Number.isFinite(v) ? v : d
}
function money(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 })
}
function compact(n: number) {
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(
    n,
  )
}

const view = computed<ViewRow[]>(() =>
  (rows.value as Ticker24h[]).map((r) => {
    const last = toNum(r.lastPrice)
    const pct = toNum(r.priceChangePercent)
    const qv = toNum(r.quoteVolume)
    const trades = toNum(r.count)
    const base = String(r.symbol).replace(SUFFIX, '')
    return {
      symbol: r.symbol,
      base,
      lastPrice: last,
      lastPriceFmt: money(last),
      pct,
      pctAbs: Math.abs(pct).toFixed(2),
      pctSign: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
      quoteVol: qv,
      quoteVolFmt: compact(qv),
      trades,
    }
  }),
)

const topN = 3
const popularRows = computed(() =>
  view.value
    .slice()
    .sort((a, b) => b.trades - a.trades)
    .slice(0, topN),
)
const topGainersRows = computed(() =>
  view.value
    .slice()
    .sort((a, b) => b.pct - a.pct)
    .slice(0, topN),
)
const topLosersRows = computed(() =>
  view.value
    .slice()
    .sort((a, b) => a.pct - b.pct)
    .slice(0, topN),
)
const topVolumeRows = computed(() =>
  view.value
    .slice()
    .sort((a, b) => b.quoteVol - a.quoteVol)
    .slice(0, topN),
)
</script>
