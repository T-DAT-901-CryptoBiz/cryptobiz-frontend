<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">Buy / Sell Split</h3>
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
type Trade = { p: string; q: string; m: boolean }
const props = withDefaults(defineProps<{ symbol: string; window?: number }>(), { window: 400 })
const { recentTrades } = useBinanceMarket()
const { connect } = useBinanceWS()

const buf: Trade[] = reactive([])
const pending = ref(true)

async function seed() {
  const r = await recentTrades(props.symbol, Math.min(props.window, 100))
  const list =
    (r.data.value as any[])?.map((t) => ({ p: t.price, q: t.qty, m: t.isBuyerMaker })) || []
  buf.splice(0, buf.length, ...list)
  pending.value = false
}

let stop: (() => void) | null = null

function open() {
  if (import.meta.server) return
  stop?.()
  stop = connect(`${props.symbol.toLowerCase()}@trade`, {
    onMessage: (m: any) => {
      if (!m?.p) return
      buf.unshift({ p: m.p, q: m.q, m: m.m })
      if (buf.length > props.window) buf.length = props.window
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

const buyUsd = computed(() => buf.reduce((a, t) => a + (!t.m ? Number(t.p) * Number(t.q) : 0), 0))
const sellUsd = computed(() => buf.reduce((a, t) => a + (t.m ? Number(t.p) * Number(t.q) : 0), 0))
const total = computed(() => Math.max(1, buyUsd.value + sellUsd.value))
const buyPct = computed(() => (buyUsd.value / total.value) * 100)
const chart = computed(() => [
  { label: 'Buy', value: buyUsd.value, color: '#10b981' },
  { label: 'Sell', value: sellUsd.value, color: '#ef4444' },
])
</script>
