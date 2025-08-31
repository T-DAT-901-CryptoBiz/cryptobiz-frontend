<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">Whale Prints</h3>
      <div class="text-xs text-white/60 flex items-center gap-2">
        Min: $
        <input
          type="number"
          v-model.number="minUsd"
          class="w-24 rounded bg-neutral-900/70 border border-white/10 px-2 py-1 text-xs"
        />
      </div>
    </div>

    <div class="divide-y divide-white/5 overflow-auto" style="max-height: 300px">
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
type Trade = { id: number; price: string; qty: string; time: number; isBuyerMaker: boolean }
const props = withDefaults(defineProps<{ symbol: string }>(), {})
const { recentTrades } = useBinanceMarket()
const { connect } = useBinanceWS()

const buf = ref<Trade[]>([])
const pending = ref(true)
const minUsd = ref(50_000)

async function seed() {
  const r = await recentTrades(props.symbol, 100)
  buf.value = ((r.data.value || []) as any[]).map((t) => ({
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
    onMessage: (m: any) => {
      if (!m?.p) return
      const usd = Number(m.p) * Number(m.q)
      if (usd >= minUsd.value) {
        buf.value.unshift({ id: m.t, price: m.p, qty: m.q, time: m.T, isBuyerMaker: m.m })
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
