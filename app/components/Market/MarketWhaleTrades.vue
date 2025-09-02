<template>
  <div
    class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
    :style="{ height: height + 'px' }"
  >
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold">Whale Prints</h3>
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-emerald-400/70"></span>
          <span class="text-xs text-white/50">live</span>
        </span>
      </div>
      <div class="text-xs text-white/60 flex items-center gap-2">
        Min: $
        <input
          type="number"
          v-model.number="minUsd"
          class="w-24 rounded bg-neutral-900/70 border border-white/10 px-2 py-1 text-xs"
        />
      </div>
    </div>

    <div class="divide-y divide-white/5 overflow-auto" :style="{ height: height - 44 + 'px' }">
      <div v-for="t in big" :key="t.id" class="px-4 py-2 text-sm flex items-center justify-between">
        <div :class="t.isBuyerMaker ? 'text-red-400' : 'text-green-400'" class="tabular-nums">
          ${{ Number(t.price).toLocaleString() }}
        </div>
        <div class="tabular-nums text-white/80">{{ Number(t.qty).toLocaleString() }}</div>
        <div class="tabular-nums font-medium">
          ${{ Math.round(Number(t.price) * Number(t.qty)).toLocaleString() }}
        </div>
        <div class="text-xs text-white/50">{{ new Date(t.time).toLocaleTimeString() }}</div>
      </div>

      <div v-if="pending" class="p-3">
        <div class="h-8 rounded bg-white/10 animate-pulse mb-2"></div>
        <div class="h-8 rounded bg-white/10 animate-pulse mb-2"></div>
        <div class="h-8 rounded bg-white/10 animate-pulse"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch, computed } from 'vue'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import { useBinanceWS } from '~/composables/useBinanceWS'

type Trade = { id: number; price: string; qty: string; time: number; isBuyerMaker: boolean }

const props = withDefaults(defineProps<{ symbol: string; height?: number }>(), {
  height: 300,
})

const { recentTrades } = useBinanceMarket()
const { connect } = useBinanceWS()

const buf = ref<Trade[]>([])
const pending = ref(true)
const minUsd = ref(50_000)

interface RecentTradeREST {
  id: number
  price: string
  qty: string
  time: number
  isBuyerMaker: boolean
}

function isRecentTradeREST(x: unknown): x is RecentTradeREST {
  if (!x || typeof x !== 'object') return false
  const v = x as Record<string, unknown>
  return (
    typeof v.id === 'number' &&
    typeof v.price === 'string' &&
    typeof v.qty === 'string' &&
    typeof v.time === 'number' &&
    typeof v.isBuyerMaker === 'boolean'
  )
}

interface TradeWS {
  p: string
  q: string
  t: number
  T: number
  m: boolean
}

function isTradeWS(x: unknown): x is TradeWS {
  if (!x || typeof x !== 'object') return false
  const v = x as Record<string, unknown>
  return (
    typeof v.p === 'string' &&
    typeof v.q === 'string' &&
    typeof v.t === 'number' &&
    typeof v.T === 'number' &&
    typeof v.m === 'boolean'
  )
}

async function seed() {
  pending.value = true
  const r = await recentTrades(props.symbol, 100)
  const arr = (r.data.value ?? []) as unknown[]
  buf.value = arr.filter(isRecentTradeREST).map((t) => ({
    id: t.id,
    price: t.price,
    qty: t.qty,
    time: t.time,
    isBuyerMaker: t.isBuyerMaker,
  }))
  pending.value = false
}

let stop: (() => void) | null = null

function open() {
  if (import.meta.server) return
  stop?.()
  stop = connect(`${props.symbol.toLowerCase()}@trade`, {
    onMessage: (msg) => {
      if (!isTradeWS(msg)) return
      const usd = Number(msg.p) * Number(msg.q)
      if (usd >= minUsd.value) {
        buf.value.unshift({ id: msg.t, price: msg.p, qty: msg.q, time: msg.T, isBuyerMaker: msg.m })
        if (buf.value.length > 200) buf.value.length = 200
      }
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

const big = computed(() => buf.value)
</script>
