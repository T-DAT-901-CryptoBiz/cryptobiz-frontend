<template>
  <DashboardTopList title="Top Losers" :items="items" :loading="pending" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import type { Ticker24h } from '~/types/binance'

const { rows, pending } = useAll24h()

const STABLES = new Set(['USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD'])
const FIAT_QUOTES = new Set([
  'TRY',
  'BRL',
  'BIDR',
  'IDRT',
  'EUR',
  'JPY',
  'GBP',
  'RUB',
  'ARS',
  'AUD',
  'CAD',
  'CHF',
  'MXN',
  'ZAR',
  'UAH',
  'NGN',
])
const BASE_BLOCKLIST = new Set([...STABLES, ...FIAT_QUOTES, 'BKRW', 'BVND'])
const MIN_QV_USD = 1_000_000
const SUFFIX = /(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/
const split = (s: string) => {
  const m = s.match(SUFFIX)
  const q = m?.[0] ?? ''
  return { base: s.slice(0, s.length - q.length), quote: q }
}
const quotePriority: Record<string, number> = {
  USDT: 6,
  FDUSD: 5,
  USDC: 4,
  BUSD: 3,
  TUSD: 2,
  USD: 1,
}
const qp = (q: string) => quotePriority[q] ?? 0
const num = (x: unknown, d = 0) => (Number.isFinite(Number(x)) ? Number(x) : d)

const clean = computed(() => {
  const byBase = new Map<string, Ticker24h>()
  for (const r of rows.value as Ticker24h[]) {
    const { base, quote } = split(String(r.symbol))
    const last = num(r.lastPrice),
      qv = num(r.quoteVolume)
    if (!STABLES.has(quote)) continue
    if (BASE_BLOCKLIST.has(base)) continue
    if (last <= 0 || qv < MIN_QV_USD) continue
    const cur = byBase.get(base)
    if (!cur) byBase.set(base, r)
    else {
      const cq = split(String(cur.symbol)).quote
      if (qp(quote) > qp(cq) || (qp(quote) === qp(cq) && qv > num(cur.quoteVolume))) {
        byBase.set(base, r)
      }
    }
  }
  return [...byBase.values()]
})

const items = computed(() =>
  clean.value
    .filter((r) => num(r.priceChangePercent) < 0)
    .sort((a, b) => num(a.priceChangePercent) - num(b.priceChangePercent))
    .slice(0, 5)
    .map((r) => ({
      symbol: r.symbol,
      value: `${num(r.priceChangePercent).toFixed(2)}%`,
      valueClass: 'text-red-400',
      label: `$${num(r.lastPrice).toLocaleString()}`,
    })),
)

defineExpose({ pending })
</script>
