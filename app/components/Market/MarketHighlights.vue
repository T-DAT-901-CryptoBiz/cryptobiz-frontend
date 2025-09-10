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
import { computed, onMounted, ref } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { Ticker24h, ExchangeInfo } from '~/types/binance'

const { rows, pending } = useAll24h()
const anyPending = computed(() => pending.value)

const { exchangeInfo } = useBinanceMarket()
const sym2Base = ref<Record<string, string>>({})
const sym2Quote = ref<Record<string, string>>({})

onMounted(async () => {
  const r = await exchangeInfo()
  await r.refresh()
  const mapB: Record<string, string> = {}
  const mapQ: Record<string, string> = {}
  ;(r.data.value?.symbols || []).forEach((s: ExchangeInfo['symbols'][number]) => {
    mapB[s.symbol] = s.baseAsset
    mapQ[s.symbol] = s.quoteAsset
  })
  sym2Base.value = mapB
  sym2Quote.value = mapQ
})

const ALLOWED_QUOTES = new Set(['USDT', 'USDC', 'FDUSD', 'TUSD', 'USD', 'BUSD'])

const BAD_BASE_SUFFIX = /(UP|DOWN|BULL|BEAR)(\d+X)?$/i

const MIN_QUOTE_VOL = 5_000_000 // $5M
const MIN_TRADES = 1_000

const QUOTE_PRIORITY: Record<string, number> = {
  USDT: 1,
  USDC: 2,
  FDUSD: 3,
  BUSD: 4,
  TUSD: 5,
  USD: 6,
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

type ViewRow = {
  symbol: string
  base: string
  quote: string
  lastPrice: number
  lastPriceFmt: string
  pct: number
  pctAbs: string
  pctSign: string
  quoteVol: number
  quoteVolFmt: string
  trades: number
}

const filtered = computed<ViewRow[]>(() => {
  const bestByBase = new Map<string, ViewRow>()

  for (const r of rows.value as Ticker24h[]) {
    const sym = r.symbol
    const base = sym2Base.value[sym] || sym.replace(/(USDT|USDC|FDUSD|BUSD|TUSD|USD)$/, '')
    const quote = sym2Quote.value[sym] || (sym.match(/USDT|USDC|FDUSD|BUSD|TUSD|USD$/)?.[0] ?? '')

    if (!ALLOWED_QUOTES.has(quote)) continue

    if (BAD_BASE_SUFFIX.test(base)) continue

    const last = toNum(r.lastPrice)
    const pct = toNum(r.priceChangePercent)
    const qv = toNum(r.quoteVolume)
    const trades = toNum(r.count)

    if (qv < MIN_QUOTE_VOL) continue
    if (trades < MIN_TRADES) continue

    const row: ViewRow = {
      symbol: sym,
      base,
      quote,
      lastPrice: last,
      lastPriceFmt: money(last),
      pct,
      pctAbs: Math.abs(pct).toFixed(2),
      pctSign: `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`,
      quoteVol: qv,
      quoteVolFmt: compact(qv),
      trades,
    }

    const prev = bestByBase.get(base)
    if (!prev) {
      bestByBase.set(base, row)
      continue
    }

    const pa = QUOTE_PRIORITY[prev.quote] ?? 999
    const pb = QUOTE_PRIORITY[row.quote] ?? 999
    if (pb < pa || (pb === pa && row.quoteVol > prev.quoteVol)) {
      bestByBase.set(base, row)
    }
  }

  return Array.from(bestByBase.values())
})

const topN = 3

const popularRows = computed(() =>
  filtered.value
    .slice()
    .sort((a, b) => b.trades - a.trades)
    .slice(0, topN),
)

const topGainersRows = computed(() =>
  filtered.value
    .slice()
    .sort((a, b) => b.pct - a.pct)
    .slice(0, topN),
)

const topVolumeRows = computed(() =>
  filtered.value
    .slice()
    .sort((a, b) => b.quoteVol - a.quoteVol)
    .slice(0, topN),
)
</script>
