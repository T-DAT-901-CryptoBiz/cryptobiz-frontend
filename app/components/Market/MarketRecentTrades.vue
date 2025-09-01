<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">Recent Trades</h3>
      <div class="text-xs text-white/50">Last {{ limit }}</div>
    </div>

    <div class="divide-y divide-white/5 overflow-auto" :style="{ height: height + 'px' }">
      <template v-if="!pending">
        <div
          v-for="t in trades"
          :key="t.id"
          class="px-4 py-2 text-sm flex items-center justify-between"
        >
          <div class="tabular-nums" :class="t.isBuyerMaker ? 'text-red-400' : 'text-green-400'">
            ${{ Number(t.price).toLocaleString() }}
          </div>
          <div class="tabular-nums text-white/80">{{ Number(t.qty).toLocaleString() }}</div>
          <div class="text-xs text-white/50">{{ new Date(t.time).toLocaleTimeString() }}</div>
        </div>
      </template>

      <template v-else>
        <div class="p-3">
          <div class="h-8 rounded bg-white/10 animate-pulse mb-2"></div>
          <div class="h-8 rounded bg-white/10 animate-pulse mb-2"></div>
          <div class="h-8 rounded bg-white/10 animate-pulse"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useBinanceWS } from '~/composables/useBinanceWS'
import { useBinanceMarket } from '~/composables/useBinanceMarket'

type Trade = {
  id: number
  price: string
  qty: string
  quoteQty: string
  time: number
  isBuyerMaker: boolean
  isBestMatch: boolean
}

const props = withDefaults(defineProps<{ symbol: string; limit?: number; height?: number }>(), {
  limit: 50,
  height: 300,
})

const { recentTrades } = useBinanceMarket()
const { connect } = useBinanceWS()

const trades = ref<Trade[]>([])
const pending = ref(true)

async function seed() {
  pending.value = true
  const r = await recentTrades(props.symbol, Math.min(props.limit, 100))
  trades.value = (r.data.value ?? []) as Trade[]
  if (trades.value.length > props.limit) trades.value.length = props.limit
  pending.value = false
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
  return (
    typeof v.p === 'string' &&
    typeof v.q === 'string' &&
    typeof v.t === 'number' &&
    typeof v.T === 'number' &&
    typeof v.m === 'boolean'
  )
}

let stop: (() => void) | null = null

function openWS() {
  if (import.meta.server) return
  stop?.()
  const path = `${props.symbol.toLowerCase()}@trade`
  stop = connect(path, {
    onMessage: (msg) => {
      if (!isTradeWS(msg)) return
      const row: Trade = {
        id: msg.t,
        price: msg.p,
        qty: msg.q,
        quoteQty: String(Number(msg.p) * Number(msg.q)),
        time: msg.T,
        isBuyerMaker: msg.m,
        isBestMatch: true,
      }
      trades.value.unshift(row)
      if (trades.value.length > props.limit) trades.value.length = props.limit
      pending.value = false
    },
  })
}

onMounted(async () => {
  await seed()
  openWS()
})
onBeforeUnmount(() => stop?.())
watch(
  () => props.symbol,
  async () => {
    await seed()
    openWS()
  },
)
</script>
