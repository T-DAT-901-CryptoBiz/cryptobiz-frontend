<template>
  <div
    class="h-full flex flex-col rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
  >
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold">Buy / Sell Split</h3>
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-emerald-400/70"></span>
          <span class="text-xs text-white/50">live</span>
        </span>
      </div>
      <div class="text-xs text-white/50">Last {{ window }} trades</div>
    </div>

    <div class="p-4">
      <ClientOnly>
        <ChartsDonut :data="chart" :loading="pending">
          <template #title><h3 class="font-semibold">Order Flow</h3></template>
          <template #center>
            <div class="text-center">
              <div class="text-2xl font-semibold tabular-nums">{{ buyPct.toFixed(1) }}%</div>
              <div class="text-xs text-white/60">Buy volume</div>
            </div>
          </template>
        </ChartsDonut>
        <template #fallback>
          <div class="h-52 rounded bg-white/10 animate-pulse" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch, computed, ref } from 'vue'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import { useBinanceWS } from '~/composables/useBinanceWS'

type MiniTrade = { p: string; q: string; m: boolean }

const props = withDefaults(defineProps<{ symbol: string; window?: number }>(), { window: 400 })

const { recentTrades } = useBinanceMarket()
const { connect } = useBinanceWS()

const buf = ref<MiniTrade[]>([])
const pending = ref(true)

interface RecentTradeREST {
  id: number
  price: string
  qty: string
  quoteQty?: string
  time: number
  isBuyerMaker: boolean
  isBestMatch?: boolean
}

function isRecentTradeREST(x: unknown): x is RecentTradeREST {
  if (!x || typeof x !== 'object') return false
  const v = x as Record<string, unknown>
  return (
    typeof v.price === 'string' && typeof v.qty === 'string' && typeof v.isBuyerMaker === 'boolean'
  )
}

interface TradeWS {
  e: 'trade'
  E: number
  s: string
  t: number
  p: string
  q: string
  b: number
  a: number
  T: number
  m: boolean
  M: boolean
}

function isTradeWS(x: unknown): x is TradeWS {
  if (!x || typeof x !== 'object') return false
  const v = x as Record<string, unknown>
  return typeof v.p === 'string' && typeof v.q === 'string' && typeof v.m === 'boolean'
}

async function seed() {
  pending.value = true
  const r = await recentTrades(props.symbol, Math.min(props.window, 100))
  const arr = (r.data.value ?? []) as unknown[]
  const list = arr
    .filter(isRecentTradeREST)
    .map<MiniTrade>((t) => ({ p: t.price, q: t.qty, m: t.isBuyerMaker }))
  buf.value = list.slice(0, props.window)
  pending.value = false
}

let stop: (() => void) | null = null

function open() {
  if (import.meta.server) return
  stop?.()
  stop = connect(`${props.symbol.toLowerCase()}@trade`, {
    onMessage: (msg) => {
      if (!isTradeWS(msg)) return
      buf.value.unshift({ p: msg.p, q: msg.q, m: msg.m })
      if (buf.value.length > props.window) buf.value.length = props.window
      pending.value = false
    },
  })
}

onMounted(async () => {
  await seed()
  open()
})
onBeforeUnmount(() => stop?.())
watch(
  () => props.symbol,
  async () => {
    await seed()
    open()
  },
)

const buyUsd = computed(() =>
  buf.value.reduce((a, t) => a + (!t.m ? Number(t.p) * Number(t.q) : 0), 0),
)
const sellUsd = computed(() =>
  buf.value.reduce((a, t) => a + (t.m ? Number(t.p) * Number(t.q) : 0), 0),
)
const total = computed(() => Math.max(1, buyUsd.value + sellUsd.value))
const buyPct = computed(() => (buyUsd.value / total.value) * 100)

const chart = computed(() => [
  { label: 'Buy', value: buyUsd.value, color: '#10b981' },
  { label: 'Sell', value: sellUsd.value, color: '#ef4444' },
])
</script>
