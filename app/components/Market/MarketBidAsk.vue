<template>
  <div
    class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
    :style="{ height: height + 'px' }"
  >
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold">Bid / Ask</h3>
        <span v-if="lastTs" class="inline-flex items-center gap-1 text-xs text-white/60">
          <span class="h-2 w-2 rounded-full bg-emerald-400/70"></span> live
        </span>
        <span v-else class="inline-flex items-center gap-1 text-xs text-white/60">
          <span class="h-2 w-2 rounded-full bg-red-400/70"></span> offline
        </span>
      </div>

      <div class="text-xs text-white/60 tabular-nums">
        <span v-if="lastTs">updated {{ sinceLast }}s ago</span>
        <span v-else>syncing…</span>
      </div>
    </div>

    <div class="p-4 grid grid-cols-2 gap-4">
      <div>
        <div class="text-xs text-white/60 mb-1">Best Bid</div>
        <div
          class="text-2xl font-semibold tabular-nums text-green-400 inline-flex items-center gap-2"
          :class="flashBid ? 'price-flash-up' : ''"
        >
          <button
            type="button"
            class="inline-flex items-center gap-2 hover:opacity-90"
            @click="copyPrice(bid)"
            :disabled="pending"
          >
            <span v-if="!pending">${{ fmtPrice(bid) }}</span
            ><span v-else>—</span>
            <Icon name="lucide:copy" class="h-4 w-4 opacity-60" />
          </button>
        </div>
        <div class="text-xs text-white/60">
          Qty: <span class="tabular-nums">{{ fmtQty(bidQty) }}</span>
        </div>
      </div>

      <div class="text-right">
        <div class="text-xs text-white/60 mb-1">Best Ask</div>
        <div
          class="text-2xl font-semibold tabular-nums text-red-400 inline-flex items-center gap-2"
          :class="flashAsk ? 'price-flash-down' : ''"
        >
          <button
            type="button"
            class="inline-flex items-center gap-2 hover:opacity-90"
            @click="copyPrice(ask)"
            :disabled="pending"
          >
            <span v-if="!pending">${{ fmtPrice(ask) }}</span
            ><span v-else>—</span>
            <Icon name="lucide:copy" class="h-4 w-4 opacity-60" />
          </button>
        </div>
        <div class="text-xs text-white/60">
          Qty: <span class="tabular-nums">{{ fmtQty(askQty) }}</span>
        </div>
      </div>

      <div class="col-span-2 grid grid-cols-3 gap-3 border-t border-white/5 pt-3 mt-1">
        <div>
          <div class="text-xs text-white/60">Mid</div>
          <div class="font-semibold tabular-nums">${{ fmtPrice(mid) }}</div>
        </div>
        <div>
          <div class="text-xs text-white/60">Micro-price</div>
          <div class="font-semibold tabular-nums">${{ fmtPrice(micro) }}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-white/60">Imbalance</div>
          <div
            class="font-semibold tabular-nums"
            :class="imbalance >= 0 ? 'text-green-300' : 'text-red-300'"
          >
            {{ (imbalance * 100).toFixed(1) }}%
          </div>
        </div>

        <div class="col-span-3">
          <div class="h-2 w-full rounded bg-white/10 overflow-hidden">
            <div
              class="h-full rounded transition-[width,background-color]"
              :class="imbalance >= 0 ? 'bg-emerald-400/40' : 'bg-rose-400/40'"
              :style="{ width: imbalanceBarLeft + '%' }"
            />
          </div>
          <div class="flex justify-between text-[11px] text-white/50 mt-1">
            <span>Sell</span><span>Buy</span>
          </div>
        </div>
      </div>

      <div class="col-span-2 flex items-center justify-between border-t border-white/5 pt-3 mt-1">
        <div class="text-sm text-white/60">Spread</div>
        <div class="flex items-center gap-3">
          <svg :width="sparkW" :height="sparkH" viewBox="0 0 120 28" aria-hidden="true">
            <path
              :d="sparkPath"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              stroke-width="1.5"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          <div class="text-right">
            <div class="font-semibold tabular-nums">${{ fmtPrice(spreadAbs) }}</div>
            <div class="text-xs text-white/60 tabular-nums">{{ spreadBps.toFixed(2) }} bps</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useBinanceWS } from '~/composables/useBinanceWS'

const props = withDefaults(
  defineProps<{
    symbol: string
    height?: number
    priceDp?: number
    qtyDp?: number
    sparkMax?: number
  }>(),
  { height: 180, priceDp: 2, qtyDp: 4, sparkMax: 60 },
)

const { connect } = useBinanceWS()

type BookTickerMsg = { b: string; B: string; a: string; A: string }

const bid = ref(0)
const ask = ref(0)
const bidQty = ref(0)
const askQty = ref(0)
const pending = ref(true)
const lastTs = ref<number | null>(null)

const prevBid = ref<number | null>(null)
const prevAsk = ref<number | null>(null)
const flashBid = ref(false)
const flashAsk = ref(false)

const fmtPrice = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: props.priceDp,
    maximumFractionDigits: Math.max(props.priceDp, 2),
  })
const fmtQty = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: props.qtyDp,
  })

const spreadAbs = computed(() => Math.max(0, ask.value - bid.value))
const spreadBps = computed(() => {
  const mid = (ask.value + bid.value) / 2 || 1
  return (spreadAbs.value / mid) * 10_000
})
const mid = computed(() => (bid.value && ask.value ? (bid.value + ask.value) / 2 : 0))
const micro = computed(() => {
  const den = bidQty.value + askQty.value
  return den > 0 ? (bid.value * askQty.value + ask.value * bidQty.value) / den : mid.value
})
const imbalance = computed(() => {
  const den = bidQty.value + askQty.value || 1
  return (bidQty.value - askQty.value) / den
})
const imbalanceBarLeft = computed(() => (imbalance.value + 1) * 50) // 0..100

const spark: number[] = []
const sparkMax = computed(() => Math.max(10, Math.min(props.sparkMax, 180)))
const sparkW = 120
const sparkH = 28
let lastPlot = 0
const sparkPath = computed(() => {
  if (spark.length < 2) return ''
  const min = Math.min(...spark)
  const max = Math.max(...spark)
  const span = Math.max(max - min, 1e-12)
  const pts = spark.map((v, i) => {
    const x = (i / (spark.length - 1)) * 120
    const y = 28 - ((v - min) / span) * 26 - 1
    return [x, y] as [number, number]
  })
  const d: (string | number)[] = ['M', pts[0][0], pts[0][1]]
  for (let i = 1; i < pts.length; i++) d.push('L', pts[i][0], pts[i][1])
  return d.join(' ')
})

function pushSpark(v: number) {
  const now = Date.now()
  if (now - lastPlot < 1000) return
  lastPlot = now
  spark.push(v)
  if (spark.length > sparkMax.value) spark.shift()
}

function flash(which: 'bid' | 'ask') {
  const g = globalThis as unknown as { setTimeout?: (cb: () => void, ms?: number) => number }
  if (which === 'bid') {
    flashBid.value = true
    g.setTimeout?.(() => (flashBid.value = false), 450)
  } else {
    flashAsk.value = true
    g.setTimeout?.(() => (flashAsk.value = false), 450)
  }
}

let stop: (() => void) | null = null
function open() {
  if (import.meta.server) return
  stop?.()
  stop = connect(`${props.symbol.toLowerCase()}@bookTicker`, {
    onMessage: (msg: unknown) => {
      const m = msg as Partial<BookTickerMsg>
      if (typeof m.b !== 'string' || typeof m.a !== 'string') return
      const b = Number(m.b)
      const a = Number(m.a)
      const B = Number(m.B ?? 0)
      const A = Number(m.A ?? 0)

      if (Number.isFinite(b)) {
        if (prevBid.value !== null && b !== prevBid.value) flash('bid')
        prevBid.value = bid.value
        bid.value = b
      }
      if (Number.isFinite(a)) {
        if (prevAsk.value !== null && a !== prevAsk.value) flash('ask')
        prevAsk.value = ask.value
        ask.value = a
      }
      bidQty.value = Number.isFinite(B) ? B : 0
      askQty.value = Number.isFinite(A) ? A : 0

      pending.value = false
      lastTs.value = Date.now()
      pushSpark(Math.max(0, a - b))
    },
  })
}

onMounted(open)
onBeforeUnmount(() => stop?.())
watch(() => props.symbol, open)

const sinceLast = computed(() =>
  lastTs.value ? Math.max(0, ((Date.now() - lastTs.value) / 1000) | 0) : 0,
)

async function copyPrice(v: number) {
  try {
    const n = v || 0
    const g = globalThis as unknown as {
      navigator?: { clipboard?: { writeText: (t: string) => Promise<void> } }
    }
    await g.navigator?.clipboard?.writeText(String(n))
  } catch {
    // ignore
  }
}
</script>

<style scoped>
@keyframes flashUp {
  0% {
    text-shadow: 0 0 0 rgba(16, 185, 129, 0);
  }
  25% {
    text-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
  }
  100% {
    text-shadow: 0 0 0 rgba(16, 185, 129, 0);
  }
}
@keyframes flashDown {
  0% {
    text-shadow: 0 0 0 rgba(239, 68, 68, 0);
  }
  25% {
    text-shadow: 0 0 12px rgba(239, 68, 68, 0.7);
  }
  100% {
    text-shadow: 0 0 0 rgba(239, 68, 68, 0);
  }
}
.price-flash-up {
  animation: flashUp 450ms ease-out;
}
.price-flash-down {
  animation: flashDown 450ms ease-out;
}
</style>
