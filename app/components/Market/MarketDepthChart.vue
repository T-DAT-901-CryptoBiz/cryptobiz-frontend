<template>
  <div
    class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
    :style="{ height: height + 'px' }"
  >
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-semibold">Depth (Cumulative)</h3>
        <span class="text-xs text-white/50">live</span>
      </div>
      <div class="flex items-center gap-4 text-xs text-white/60">
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-emerald-400/70"></span> Bids
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-rose-400/70"></span> Asks
        </span>
        <span class="opacity-60">{{ asks.length + bids.length }} pts</span>
      </div>
    </div>

    <div class="p-3" :style="{ height: chartH + 'px' }">
      <svg
        v-if="!pending"
        ref="svgRef"
        :viewBox="`0 0 ${svgW} ${svgH}`"
        class="w-full h-full select-none"
        @mousemove="onMove"
        @mouseleave="onLeave"
      >
        <defs>
          <linearGradient id="gradBid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgb(16 185 129 / 0.35)" />
            <stop offset="100%" stop-color="rgb(16 185 129 / 0.05)" />
          </linearGradient>
          <linearGradient id="gradAsk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgb(239 68 68 / 0.35)" />
            <stop offset="100%" stop-color="rgb(239 68 68 / 0.05)" />
          </linearGradient>
        </defs>

        <g>
          <line
            v-for="g in gridY"
            :key="'gy' + g.y"
            :x1="padL"
            :x2="svgW - padR"
            :y1="g.y"
            :y2="g.y"
            stroke="rgba(255,255,255,0.08)"
            stroke-width="1"
          />
          <text
            v-for="g in gridY"
            :key="'gt' + g.y"
            :x="svgW - padR + 6"
            :y="g.y + 3"
            font-size="10"
            fill="rgba(255,255,255,0.45)"
          >
            {{ qtyCompact(g.v) }}
          </text>
        </g>

        <g v-if="Number.isFinite(midXView)">
          <line
            :x1="midXView"
            :x2="midXView"
            :y1="padT"
            :y2="svgH - padB"
            stroke="rgba(255,255,255,0.12)"
            stroke-dasharray="4 3"
            stroke-width="1"
          />
          <rect
            :x="midXView - 40"
            :y="padT - 18"
            width="80"
            height="16"
            rx="3"
            fill="rgba(255,255,255,0.06)"
          />
          <text
            :x="midXView"
            :y="padT - 5"
            text-anchor="middle"
            font-size="10"
            fill="rgba(255,255,255,0.8)"
          >
            {{ money(midPrice) }}
          </text>
        </g>

        <path
          :d="areaPath(bids)"
          fill="url(#gradBid)"
          stroke="rgba(16,185,129,0.6)"
          stroke-width="1.2"
        />
        <path
          :d="areaPath(asks)"
          fill="url(#gradAsk)"
          stroke="rgba(239,68,68,0.6)"
          stroke-width="1.2"
        />

        <g font-size="10" fill="rgba(255,255,255,0.55)">
          <text :x="padL" :y="svgH - 4">{{ money(minXRaw) }}</text>
          <text :x="(padL + (svgW - padR)) / 2" :y="svgH - 4" text-anchor="middle">
            {{ money((minXRaw + maxXRaw) / 2) }}
          </text>
          <text :x="svgW - padR" :y="svgH - 4" text-anchor="end">{{ money(maxXRaw) }}</text>
        </g>

        <g v-if="hover" pointer-events="none">
          <line
            :x1="hover.x"
            :x2="hover.x"
            :y1="padT"
            :y2="svgH - padB"
            stroke="rgba(255,255,255,0.15)"
            stroke-width="1"
          />
          <circle
            :cx="hover.x"
            :cy="hover.y"
            r="3.2"
            :fill="hover.side === 'bid' ? 'rgb(16 185 129)' : 'rgb(239 68 68)'"
          />
          <rect
            :x="Math.min(Math.max(hover.x + 8, padL), svgW - padR - 140)"
            :y="Math.max(hover.y - 32, padT + 2)"
            width="140"
            height="28"
            rx="6"
            fill="rgba(0,0,0,0.55)"
            stroke="rgba(255,255,255,0.08)"
          />
          <text
            :x="Math.min(Math.max(hover.x + 16, padL + 8), svgW - padR - 124)"
            :y="Math.max(hover.y - 14, padT + 14)"
            font-size="11"
            fill="white"
          >
            {{ money(hover.price) }}
          </text>
          <text
            :x="Math.min(Math.max(hover.x + 16, padL + 8), svgW - padR - 124)"
            :y="Math.max(hover.y, padT + 24)"
            font-size="10"
            fill="rgba(255,255,255,0.7)"
          >
            Cum: {{ qty(hover.qty) }}
          </text>
        </g>
      </svg>

      <div v-else class="h-full rounded-lg bg-white/10 animate-pulse"></div>
    </div>

    <div
      class="px-4 py-2 border-t border-white/5 text-xs text-white/60 flex items-center justify-between"
    >
      <div>Totals</div>
      <div class="flex items-center gap-4 tabular-nums">
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-emerald-400/70"></span> {{ qty(totalBid) }}
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-rose-400/70"></span> {{ qty(totalAsk) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useBinanceWS } from '~/composables/useBinanceWS'
import { useBinanceMarket } from '~/composables/useBinanceMarket'

const props = withDefaults(defineProps<{ symbol: string; limit?: number; height?: number }>(), {
  limit: 50,
  height: 260,
})

const { orderBook } = useBinanceMarket()
const { connect } = useBinanceWS()

type Pair = [number, number]
type StrPair = [string, string]

const asks = ref<Pair[]>([])
const bids = ref<Pair[]>([])
const pending = ref(true)

const chartH = computed(() => Math.max(120, (props.height ?? 260) - 44 - 40))

async function seed() {
  const r = await orderBook(props.symbol, Math.min(props.limit as number, 100))
  const a0 = (r.data.value?.asks ?? [])
    .slice(0, props.limit)
    .map(([p, q]: StrPair) => [Number(p), Number(q)] as Pair)
  const b0 = (r.data.value?.bids ?? [])
    .slice(0, props.limit)
    .map(([p, q]: StrPair) => [Number(p), Number(q)] as Pair)
  asksMap.clear()
  bidsMap.clear()
  for (const [p, q] of a0) asksMap.set(p, q)
  for (const [p, q] of b0) bidsMap.set(p, q)
  rebuild()
  pending.value = false
}

type DepthPartialMsg = { bids?: StrPair[]; asks?: StrPair[] }
type DepthDiffMsg = { b?: StrPair[]; a?: StrPair[] }

type ObjRec = Record<string, unknown>
const isObj = (x: unknown): x is ObjRec => typeof x === 'object' && x !== null
const isStrPair = (t: unknown): t is StrPair =>
  Array.isArray(t) && t.length === 2 && typeof t[0] === 'string' && typeof t[1] === 'string'
const isArrStrPair = (a: unknown): a is StrPair[] => Array.isArray(a) && a.every(isStrPair)

function isPartial(x: unknown): x is DepthPartialMsg {
  if (!isObj(x)) return false
  if ('asks' in x && !isArrStrPair((x as ObjRec).asks)) return false
  if ('bids' in x && !isArrStrPair((x as ObjRec).bids)) return false
  return true
}
function isDiff(x: unknown): x is DepthDiffMsg {
  if (!isObj(x)) return false
  if ('a' in x && !isArrStrPair((x as ObjRec).a)) return false
  if ('b' in x && !isArrStrPair((x as ObjRec).b)) return false
  return true
}

const asksMap = new Map<number, number>()
const bidsMap = new Map<number, number>()

function apply(map: Map<number, number>, updates: StrPair[]) {
  for (const [ps, qs] of updates) {
    const p = Number(ps)
    const q = Number(qs)
    if (!Number.isFinite(p)) continue
    if (!Number.isFinite(q) || q === 0) map.delete(p)
    else map.set(p, q)
  }
}

function rebuild() {
  const a = [...asksMap.entries()].sort((x, y) => x[0] - y[0]).slice(0, props.limit)
  const b = [...bidsMap.entries()].sort((x, y) => y[0] - x[0]).slice(0, props.limit)
  asks.value = cum(
    a.map(([p, q]) => [p, q] as Pair),
    true,
  )
  bids.value = cum(
    b.map(([p, q]) => [p, q] as Pair),
    false,
  )
}

let stop: (() => void) | null = null
function open() {
  if (import.meta.server) return
  stop?.()
  const usePartial = props.limit === 5 || props.limit === 10 || props.limit === 20
  if (usePartial) {
    const path = `${props.symbol.toLowerCase()}@depth${props.limit}@100ms`
    stop = connect(path, {
      onMessage: (m: unknown) => {
        if (!isPartial(m)) return
        if (m.asks) apply(asksMap, m.asks)
        if (m.bids) apply(bidsMap, m.bids)
        rebuild()
        pending.value = false
      },
    })
  } else {
    const path = `${props.symbol.toLowerCase()}@depth@100ms`
    stop = connect(path, {
      onMessage: (m: unknown) => {
        if (!isDiff(m)) return
        if (m.a) apply(asksMap, m.a)
        if (m.b) apply(bidsMap, m.b)
        rebuild()
        pending.value = false
      },
    })
  }
}

function cum(arr: ReadonlyArray<Pair>, reverse: boolean): Pair[] {
  const out = new Array<Pair>(arr.length)
  let s = 0
  if (reverse) {
    for (let i = arr.length - 1; i >= 0; i--) {
      s += arr[i][1]
      out[i] = [arr[i][0], s]
    }
  } else {
    for (let i = 0; i < arr.length; i++) {
      s += arr[i][1]
      out[i] = [arr[i][0], s]
    }
  }
  return out
}

onMounted(async () => {
  await seed()
  open()
})
onBeforeUnmount(() => stop?.())
watch(
  () => [props.symbol, props.limit],
  async () => {
    await seed()
    open()
  },
)

const svgW = 680
const svgH = 220
const padL = 42
const padR = 64
const padT = 24
const padB = 24

const all = computed(() => [...asks.value, ...bids.value])
const minXRaw = computed(() => (all.value.length ? Math.min(...all.value.map((p) => p[0])) : 0))
const maxXRaw = computed(() => (all.value.length ? Math.max(...all.value.map((p) => p[0])) : 1))
const maxYRaw = computed(() => (all.value.length ? Math.max(...all.value.map((p) => p[1])) : 1))

function sx(x: number) {
  const span = Math.max(maxXRaw.value - minXRaw.value, 1e-12)
  return padL + ((x - minXRaw.value) / span) * (svgW - padL - padR)
}
function sy(y: number) {
  const span = Math.max(maxYRaw.value, 1e-12)
  return svgH - padB - (y / span) * (svgH - padT - padB)
}

function areaPath(pts: ReadonlyArray<Pair> | null | undefined): string {
  if (!pts || pts.length === 0) return ''
  const p = pts.map(([x, y]) => [sx(x), sy(y)] as [number, number])
  const d: (string | number)[] = ['M', p[0][0], p[0][1]]
  for (let i = 1; i < p.length; i++) d.push('L', p[i][0], p[i][1])
  d.push('L', p[p.length - 1][0], svgH - padB, 'L', p[0][0], svgH - padB, 'Z')
  return d.join(' ')
}

const gridY = computed(() => {
  const ticks = 4
  const out: { y: number; v: number }[] = []
  for (let i = 0; i <= ticks; i++) {
    const v = (maxYRaw.value / ticks) * i
    out.push({ y: sy(v), v })
  }
  return out
})

const bestBid = computed(() => (bids.value.length ? bids.value[0][0] : NaN))
const bestAsk = computed(() => (asks.value.length ? asks.value[0][0] : NaN))
const midPrice = computed(() => {
  const b = bestBid.value
  const a = bestAsk.value
  return Number.isFinite(b) && Number.isFinite(a) ? (a + b) / 2 : NaN
})
const midXView = computed(() => {
  const m = midPrice.value
  return Number.isFinite(m) ? sx(m) : NaN
})

type Rect = { left: number; top: number; width: number; height: number }
type ElWithRect = { getBoundingClientRect: () => Rect }
const svgRef = ref<ElWithRect | null>(null)

interface Hover {
  x: number
  y: number
  price: number
  qty: number
  side: 'bid' | 'ask'
}
const hover = ref<Hover | null>(null)

type MouseEvt = { clientX: number; clientY: number }
function onMove(ev: MouseEvt) {
  const el = svgRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const xView = ((ev.clientX - rect.left) / rect.width) * svgW
  let best: Hover | null = null
  const probe = (pts: Pair[], side: 'bid' | 'ask') => {
    for (const [px, q] of pts) {
      const xv = sx(px)
      const d = Math.abs(xv - xView)
      if (!best || d < Math.abs(best.x - xView)) best = { x: xv, y: sy(q), price: px, qty: q, side }
    }
  }
  probe(asks.value, 'ask')
  probe(bids.value, 'bid')
  hover.value = best
}
function onLeave() {
  hover.value = null
}

const totalAsk = computed(() => (asks.value.length ? asks.value[0][1] : 0))
const totalBid = computed(() => (bids.value.length ? bids.value[bids.value.length - 1][1] : 0))

const money = (n: number) => '$' + n.toLocaleString(undefined, { maximumFractionDigits: 6 })
const qty = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 })
const qtyCompact = (n: number) =>
  new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
</script>
