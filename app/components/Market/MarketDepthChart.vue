<template>
  <div
    class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
    :style="{ height: height + 'px' }"
  >
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">Depth (Cumulative)</h3>
      <div class="text-xs text-white/50">{{ pointsAsks.length + pointsBids.length }} pts</div>
    </div>

    <div class="p-3 h-full">
      <svg v-if="!pending" :viewBox="`0 0 ${svgW} ${svgH}`" class="w-full h-full">
        <path
          :d="path(pointsAsks)"
          fill="rgba(239,68,68,0.15)"
          stroke="rgba(239,68,68,0.5)"
          stroke-width="1"
        />
        <path
          :d="path(pointsBids)"
          fill="rgba(16,185,129,0.15)"
          stroke="rgba(16,185,129,0.5)"
          stroke-width="1"
        />
      </svg>
      <div v-else class="h-full rounded bg-white/10 animate-pulse"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, computed, watch } from 'vue'
import { useBinanceWS } from '~/composables/useBinanceWS'
import { useBinanceMarket } from '~/composables/useBinanceMarket'

const props = withDefaults(defineProps<{ symbol: string; limit?: number; height?: number }>(), {
  limit: 50,
  height: 220,
})
const { orderBook } = useBinanceMarket()
const { connect } = useBinanceWS()

const asks = ref<[number, number][]>([])
const bids = ref<[number, number][]>([])
const pending = ref(true)

interface DepthPartialMsg {
  lastUpdateId?: number
  bids?: [string, string][]
  asks?: [string, string][]
}

async function seed() {
  const r = await orderBook(props.symbol, Math.min(props.limit as number, 100))
  const asksRaw = (r.data.value?.asks || [])
    .slice(-props.limit)
    .map(([p, q]: [string, string]) => [Number(p), Number(q)] as [number, number])
  const bidsRaw = (r.data.value?.bids || [])
    .slice(0, props.limit)
    .map(([p, q]: [string, string]) => [Number(p), Number(q)] as [number, number])

  asks.value = cum(asksRaw, true)
  bids.value = cum(bidsRaw, false)
  pending.value = false
}

let stop: (() => void) | null = null

function open() {
  if (import.meta.server) return
  stop?.()
  stop = connect(`${props.symbol.toLowerCase()}@depth${props.limit}@100ms`, {
    onMessage: (msg: unknown) => {
      const m = msg as DepthPartialMsg
      if (!Array.isArray(m.asks) || !Array.isArray(m.bids)) return

      const asksRaw = m.asks.map(([p, q]) => [Number(p), Number(q)] as [number, number])
      const bidsRaw = m.bids.map(([p, q]) => [Number(p), Number(q)] as [number, number])

      asks.value = cum(asksRaw, true)
      bids.value = cum(bidsRaw, false)
      pending.value = false
    },
  })
}

function cum(arr: ReadonlyArray<[number, number]>, reverse: boolean): [number, number][] {
  const out = new Array<[number, number]>(arr.length)
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

const svgW = 600,
  svgH = 160
const allX = computed(() => [...asks.value, ...bids.value].map((p) => p[0]))
const allY = computed(() => [...asks.value, ...bids.value].map((p) => p[1]))
const minX = computed(() => Math.min(...allX.value, Infinity))
const maxX = computed(() => Math.max(...allX.value, 0))
const maxY = computed(() => Math.max(...allY.value, 1))

function scaleX(x: number) {
  return ((x - minX.value) / (maxX.value - minX.value || 1)) * svgW
}

function scaleY(y: number) {
  return svgH - (y / (maxY.value || 1)) * svgH
}

function path(pts: [number, number][]) {
  if (!pts.length) return ''
  const p = pts.map(([x, y]) => [scaleX(x), scaleY(y)] as [number, number])
  const d = ['M', p[0][0], p[0][1], ...p.slice(1).flatMap(([x, y]) => ['L', x, y])]
  d.push('L', p[p.length - 1][0], svgH, 'L', p[0][0], svgH, 'Z')
  return d.join(' ')
}

const pointsAsks = computed(() => asks.value)
const pointsBids = computed(() => bids.value)
</script>
