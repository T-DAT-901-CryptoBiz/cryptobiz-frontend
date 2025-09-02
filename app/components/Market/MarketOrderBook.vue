<template>
  <div
    class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
    :style="{ height: height + 'px' }"
  >
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold">Order Book</h3>
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-emerald-400/70"></span>
          <span class="text-xs text-white/50">live</span>
        </span>
      </div>
      <div class="flex items-center gap-3 text-xs text-white/60">
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-emerald-400/70"></span> Bids
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-rose-400/70"></span> Asks
        </span>
        <span class="opacity-60">Level: {{ limit }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-px bg-white/5" :style="{ height: contentH + 'px' }">
      <div class="flex flex-col overflow-auto">
        <div
          class="sticky top-0 z-10 bg-neutral-900/80 backdrop-blur-sm border-b border-white/5 px-3 py-2"
        >
          <div class="text-xs text-white/60 flex items-center justify-between">
            <span class="w-1/3 text-right">Price</span>
            <span class="w-1/3 text-right">Qty</span>
            <span class="w-1/3 text-right">Cum.</span>
          </div>
        </div>

        <template v-if="!pending">
          <div v-for="(a, i) in asks" :key="'a' + i" class="relative">
            <div
              class="absolute inset-y-0 right-0 bg-rose-500/15"
              :style="{ width: askPct[i] + '%' }"
            />
            <div
              class="relative grid grid-cols-3 gap-2 text-xs px-3 py-1.5 hover:bg-white/5 transition-colors"
            >
              <span class="w-full text-right tabular-nums font-medium text-rose-400">
                {{ money(Number(a[0])) }}
              </span>
              <span class="w-full text-right tabular-nums text-white/80">
                {{ qty(Number(a[1])) }}
              </span>
              <span class="w-full text-right tabular-nums text-white/70">
                {{ qty(cumAsk[i]) }}
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="i in 10"
            :key="'sk-a' + i"
            class="h-6 mx-3 my-1 rounded bg-white/10 animate-pulse"
          />
        </template>
      </div>

      <div class="flex flex-col overflow-auto">
        <div
          class="sticky top-0 z-10 bg-neutral-900/80 backdrop-blur-sm border-b border-white/5 px-3 py-2"
        >
          <div class="text-xs text-white/60 flex items-center justify-between">
            <span class="w-1/3">Price</span>
            <span class="w-1/3 text-right">Qty</span>
            <span class="w-1/3 text-right">Cum.</span>
          </div>
        </div>

        <template v-if="!pending">
          <div v-for="(b, i) in bids" :key="'b' + i" class="relative">
            <div
              class="absolute inset-y-0 left-0 bg-emerald-500/15"
              :style="{ width: bidPct[i] + '%' }"
            />
            <div
              class="relative grid grid-cols-3 gap-2 text-xs px-3 py-1.5 hover:bg-white/5 transition-colors"
            >
              <span class="w-full tabular-nums font-medium">
                {{ money(Number(b[0])) }}
              </span>
              <span class="w-full text-right tabular-nums text-white/80">
                {{ qty(Number(b[1])) }}
              </span>
              <span class="w-full text-right tabular-nums text-white/70">
                {{ qty(cumBid[i]) }}
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="i in 10"
            :key="'sk-b' + i"
            class="h-6 mx-3 my-1 rounded bg-white/10 animate-pulse"
          />
        </template>
      </div>
    </div>

    <div
      class="px-4 py-2 border-t border-white/5 text-xs text-white/60 flex items-center justify-between"
    >
      <div>Totals in view</div>
      <div class="flex items-center gap-4 tabular-nums">
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-emerald-400/70"></span>
          Bids: {{ qty(totalBid) }}
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-rose-400/70"></span>
          Asks: {{ qty(totalAsk) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useBinanceWS } from '~/composables/useBinanceWS'
import { useBinanceMarket } from '~/composables/useBinanceMarket'

const props = withDefaults(
  defineProps<{ symbol: string; limit?: 5 | 10 | 20 | 50 | 100; height?: number }>(),
  { limit: 50, height: 300 },
)

const { orderBook } = useBinanceMarket()
const { connect } = useBinanceWS()

const asks = ref<[string, string][]>([])
const bids = ref<[string, string][]>([])
const pending = ref(true)

const contentH = computed(() => Math.max(120, (props.height ?? 300) - 44 - 40))

const cumAsk = computed(() => {
  const arr: number[] = []
  let s = 0
  for (let i = asks.value.length - 1; i >= 0; i--) {
    s += Number(asks.value[i][1])
    arr[i] = s
  }
  return arr
})
const cumBid = computed(() => {
  const arr: number[] = []
  let s = 0
  for (let i = 0; i < bids.value.length; i++) {
    s += Number(bids.value[i][1])
    arr[i] = s
  }
  return arr
})
const askPct = computed(() => {
  const max = Math.max(...cumAsk.value, 1)
  return cumAsk.value.map((v) => (v / max) * 100)
})
const bidPct = computed(() => {
  const max = Math.max(...cumBid.value, 1)
  return cumBid.value.map((v) => (v / max) * 100)
})

async function seed() {
  pending.value = true
  const r = await orderBook(props.symbol, props.limit)
  asks.value = (r.data.value?.asks || []).slice(-props.limit)
  bids.value = (r.data.value?.bids || []).slice(0, props.limit)

  asksMap.clear()
  bidsMap.clear()
  for (const [p, q] of asks.value) asksMap.set(Number(p), Number(q))
  for (const [p, q] of bids.value) bidsMap.set(Number(p), Number(q))

  pending.value = false
}

type StrTuple = [string, string]
type DepthPartialMsg = { bids?: StrTuple[]; asks?: StrTuple[] }
type DepthDiffMsg = {
  e?: string
  E?: number
  s?: string
  U?: number
  u?: number
  pu?: number
  b?: StrTuple[]
  a?: StrTuple[]
}
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const isStrTuple = (t: unknown): t is StrTuple =>
  Array.isArray(t) && t.length === 2 && typeof t[0] === 'string' && typeof t[1] === 'string'
const isArrayOfStrTuple = (a: unknown): a is StrTuple[] => Array.isArray(a) && a.every(isStrTuple)
function isDepthPartialMsg(x: unknown): x is DepthPartialMsg {
  if (!isObj(x)) return false
  const v = x as { bids?: unknown; asks?: unknown }
  return (!v.bids || isArrayOfStrTuple(v.bids)) && (!v.asks || isArrayOfStrTuple(v.asks))
}
function isDepthDiffMsg(x: unknown): x is DepthDiffMsg {
  if (!isObj(x)) return false
  const v = x as { b?: unknown; a?: unknown }
  return (!v.b || isArrayOfStrTuple(v.b)) && (!v.a || isArrayOfStrTuple(v.a))
}

const asksMap = new Map<number, number>()
const bidsMap = new Map<number, number>()

function applySide(map: Map<number, number>, updates: StrTuple[]) {
  for (const [pStr, qStr] of updates) {
    const p = Number(pStr)
    const q = Number(qStr)
    if (!Number.isFinite(p)) continue
    if (!Number.isFinite(q) || q === 0) map.delete(p)
    else map.set(p, q)
  }
}

function rebuildTopN() {
  const topAsks = [...asksMap.entries()].sort((a, b) => a[0] - b[0]).slice(0, props.limit)
  const topBids = [...bidsMap.entries()].sort((a, b) => b[0] - a[0]).slice(0, props.limit)
  asks.value = topAsks.map(([p, q]) => [String(p), String(q)])
  bids.value = topBids.map(([p, q]) => [String(p), String(q)])
}

let stop: (() => void) | null = null
function openWS() {
  if (import.meta.server) return
  stop?.()

  const canPartial = props.limit === 5 || props.limit === 10 || props.limit === 20

  if (canPartial) {
    const path = `${props.symbol.toLowerCase()}@depth${props.limit}@100ms`
    stop = connect(path, {
      onMessage: (m: unknown) => {
        if (!isDepthPartialMsg(m)) return
        if (m.asks) asks.value = m.asks
        if (m.bids) bids.value = m.bids
        asksMap.clear()
        bidsMap.clear()
        for (const [p, q] of asks.value) asksMap.set(Number(p), Number(q))
        for (const [p, q] of bids.value) bidsMap.set(Number(p), Number(q))
        pending.value = false
      },
    })
  } else {
    const path = `${props.symbol.toLowerCase()}@depth@100ms`
    stop = connect(path, {
      onMessage: (m: unknown) => {
        if (!isDepthDiffMsg(m)) return
        if (m.a && m.a.length) applySide(asksMap, m.a)
        if (m.b && m.b.length) applySide(bidsMap, m.b)
        rebuildTopN()
        pending.value = false
      },
    })
  }
}

onMounted(async () => {
  await seed()
  openWS()
})
onBeforeUnmount(() => stop?.())
watch(
  () => [props.symbol, props.limit],
  async () => {
    await seed()
    openWS()
  },
)

const totalAsk = computed(() => (cumAsk.value.length ? cumAsk.value[0] : 0))
const totalBid = computed(() => (cumBid.value.length ? cumBid.value[cumBid.value.length - 1] : 0))

const money = (n: number) => '$' + n.toLocaleString(undefined, { maximumFractionDigits: 6 })
const qty = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 })
</script>
