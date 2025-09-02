<template>
  <aside class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">Realtime Microstructure</h3>
      <div class="text-xs text-white/60 whitespace-nowrap">
        <span v-if="loading" class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-white/40 animate-pulse"></span> syncing…
        </span>
        <span v-else class="inline-flex items-center gap-2">
          <span class="inline-block h-2 w-2 rounded-full bg-emerald-400/70"></span> live
        </span>
      </div>
    </div>

    <div class="p-4">
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[1fr]">
        <div
          class="h-full rounded-xl border border-white/10 p-3 bg-white/5 flex flex-col justify-between"
        >
          <div class="text-white/60 text-xs mb-0.5">Spread</div>
          <div class="space-y-0.5">
            <div class="text-xl font-semibold tabular-nums whitespace-nowrap">
              <span v-if="!loading">${{ spreadAbs.toLocaleString() }}</span>
              <span v-else class="inline-block h-5 w-24 rounded bg-white/10 animate-pulse" />
            </div>
            <div class="text-xs text-white/50 tabular-nums whitespace-nowrap">
              <span v-if="!loading">{{ spreadBps.toFixed(2) }} bps</span>
              <span v-else class="inline-block h-3 w-16 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        </div>

        <div
          class="h-full rounded-xl border border-white/10 p-3 bg-white/5 flex flex-col justify-between"
        >
          <div class="text-white/60 text-xs mb-0.5">Order Imbalance (Top)</div>
          <div class="space-y-0.5">
            <div
              class="text-xl font-semibold tabular-nums whitespace-nowrap"
              :class="imbalance >= 0 ? 'text-green-300' : 'text-red-300'"
            >
              <span v-if="!loading">{{ (imbalance * 100).toFixed(1) }}%</span>
              <span v-else class="inline-block h-5 w-20 rounded bg-white/10 animate-pulse" />
            </div>
            <div class="text-xs text-white/50 whitespace-nowrap">
              {{ bidQty.toLocaleString() }} vs {{ askQty.toLocaleString() }}
            </div>
          </div>
        </div>

        <div
          class="h-full rounded-xl border border-white/10 p-3 bg-white/5 flex flex-col justify-between"
        >
          <div class="text-white/60 text-xs mb-0.5">Trades / min</div>
          <div class="space-y-0.5">
            <div class="text-xl font-semibold tabular-nums whitespace-nowrap">
              <span v-if="!loading">{{ tradesPerMin.toFixed(1) }}</span>
              <span v-else class="inline-block h-5 w-16 rounded bg-white/10 animate-pulse" />
            </div>
            <div class="text-xs text-white/50">last 60s window</div>
          </div>
        </div>

        <div
          class="h-full rounded-xl border border-white/10 p-3 bg-white/5 flex flex-col justify-between"
        >
          <div class="text-white/60 text-xs mb-0.5">Avg Trade Size ($)</div>
          <div class="space-y-0.5">
            <div class="text-xl font-semibold tabular-nums whitespace-nowrap">
              <span v-if="!loading">${{ avgTradeUsd.toLocaleString() }}</span>
              <span v-else class="inline-block h-5 w-28 rounded bg-white/10 animate-pulse" />
            </div>
            <div class="text-xs text-white/50">last 60s window</div>
          </div>
        </div>

        <div
          class="h-full rounded-xl border border-white/10 p-3 bg-white/5 flex flex-col justify-between"
        >
          <div class="text-white/60 text-xs mb-0.5">VWAP(24h) Deviation</div>
          <div class="space-y-0.5">
            <div
              class="text-xl font-semibold tabular-nums whitespace-nowrap"
              :class="vwapDev >= 0 ? 'text-green-300' : 'text-red-300'"
            >
              <span v-if="!loading">{{ vwapDev.toFixed(2) }}%</span>
              <span v-else class="inline-block h-5 w-20 rounded bg-white/10 animate-pulse" />
            </div>
            <div class="text-xs text-white/50 whitespace-nowrap">price vs (quoteVol/baseVol)</div>
          </div>
        </div>

        <div
          class="h-full rounded-xl border border-white/10 p-3 bg-white/5 flex flex-col justify-between"
        >
          <div class="text-white/60 text-xs mb-0.5">From 24h High</div>
          <div class="space-y-0.5">
            <div
              class="text-xl font-semibold tabular-nums whitespace-nowrap"
              :class="fromHigh <= 0 ? 'text-red-300' : 'text-green-300'"
            >
              <span v-if="!loading">{{ fromHigh.toFixed(2) }}%</span>
              <span v-else class="inline-block h-5 w-16 rounded bg-white/10 animate-pulse" />
            </div>
            <div class="text-xs text-white/50 whitespace-nowrap">
              high: ${{ high24h.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTicker } from '~/composables/useTicker'
import { useBinanceWS } from '~/composables/useBinanceWS'

const props = defineProps<{ symbol: string }>()

type BookTickerWS = { b: string; B: string; a: string; A: string }
type TradeWS = { t: number; p: string; q: string; T: number }
type MiniTickerWS = { c: string }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const isBook = (x: unknown): x is BookTickerWS =>
  isObj(x) &&
  typeof x.b === 'string' &&
  typeof x.a === 'string' &&
  typeof x.B === 'string' &&
  typeof x.A === 'string'
const isTrade = (x: unknown): x is TradeWS =>
  isObj(x) &&
  typeof x.p === 'string' &&
  typeof x.q === 'string' &&
  typeof x.t === 'number' &&
  typeof x.T === 'number'
const isMini = (x: unknown): x is MiniTickerWS => isObj(x) && typeof x.c === 'string'

const { connect } = useBinanceWS()
const { data: t } = useTicker(props.symbol)

const lastPrice = ref<number | null>(null)
const bid = ref(0)
const ask = ref(0)
const bidQty = ref(0)
const askQty = ref(0)

let stopBook: (() => void) | null = null
let stopTrade: (() => void) | null = null
let stopMini: (() => void) | null = null

function openWS(): void {
  if (import.meta.server) return
  stopBook?.()
  stopTrade?.()
  stopMini?.()

  stopBook = connect(`${props.symbol.toLowerCase()}@bookTicker`, {
    onMessage: (m: unknown) => {
      if (!isBook(m)) return
      bid.value = Number(m.b) || 0
      ask.value = Number(m.a) || 0
      bidQty.value = Number(m.B) || 0
      askQty.value = Number(m.A) || 0
    },
  })

  const buf: { t: number; usd: number }[] = []
  stopTrade = connect(`${props.symbol.toLowerCase()}@trade`, {
    onMessage: (m: unknown) => {
      if (!isTrade(m)) return
      const usd = Number(m.p) * Number(m.q)
      const now = m.T
      buf.push({ t: now, usd })
      const cutoff = now - 60_000
      while (buf.length && buf[0].t < cutoff) buf.shift()
      tradeCount.value = buf.length
      avgTradeUsd.value = buf.length ? buf.reduce((a, x) => a + x.usd, 0) / buf.length : 0
    },
  })

  stopMini = connect(`${props.symbol.toLowerCase()}@miniTicker`, {
    onMessage: (m: unknown) => {
      if (!isMini(m)) return
      const p = Number(m.c)
      if (Number.isFinite(p)) lastPrice.value = p
    },
  })
}

onMounted(openWS)
onBeforeUnmount(() => {
  stopBook?.()
  stopTrade?.()
  stopMini?.()
})
watch(() => props.symbol, openWS)

const priceNow = computed(() => lastPrice.value ?? Number(t.value?.lastPrice ?? 0))
const high24h = computed(() => Number(t.value?.highPrice ?? 0))
const baseVol = computed(() => Number(t.value?.volume ?? 0))
const quoteVol = computed(() => Number(t.value?.quoteVolume ?? 0))

const spreadAbs = computed(() => Math.max(0, ask.value - bid.value))
const spreadBps = computed(() => (spreadAbs.value / ((ask.value + bid.value) / 2 || 1)) * 10_000)
const imbalance = computed(() => {
  const den = bidQty.value + askQty.value || 1
  return (bidQty.value - askQty.value) / den
})

const tradeCount = ref(0)
const tradesPerMin = computed(() => tradeCount.value)
const avgTradeUsd = ref(0)

const vwap24h = computed(() => (baseVol.value > 0 ? quoteVol.value / baseVol.value : 0))
const vwapDev = computed(() =>
  vwap24h.value > 0 ? ((priceNow.value || 0) / vwap24h.value - 1) * 100 : 0,
)
const fromHigh = computed(() => {
  const h = high24h.value || 0
  const p = priceNow.value || 0
  return h > 0 ? (p / h - 1) * 100 : 0
})

const loading = computed(() => !priceNow.value || (!bid.value && !ask.value))
</script>
