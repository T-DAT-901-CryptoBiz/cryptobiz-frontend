<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">Order Book</h3>
      <div class="text-xs text-white/50">Level: {{ limit }}</div>
    </div>

    <div class="grid grid-cols-2 gap-px bg-white/5" :style="{ height: height + 'px' }">
      <div class="p-3 flex flex-col overflow-auto space-y-1">
        <div class="text-xs text-white/60 mb-1 sticky top-0 bg-neutral-900/60">Asks</div>

        <template v-if="!pending">
          <div v-for="(a, i) in asks" :key="'a' + i" class="relative">
            <div
              class="absolute inset-y-0 right-0 bg-red-500/10"
              :style="{ width: askPct[i] + '%' }"
            />
            <div class="relative grid grid-cols-3 gap-2 text-xs px-2 py-1 rounded">
              <span class="text-red-400 tabular-nums text-right"
                >${{ Number(a[0]).toLocaleString() }}</span
              >
              <span class="tabular-nums text-right">{{ Number(a[1]).toLocaleString() }}</span>
              <span class="tabular-nums text-right">{{ cumAsk[i].toLocaleString() }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="i in 10" :key="'sk-a' + i" class="h-6 rounded bg-white/10 animate-pulse" />
        </template>
      </div>

      <div class="p-3 flex flex-col overflow-auto space-y-1">
        <div class="text-xs text-white/60 mb-1 sticky top-0 bg-neutral-900/60">Bids</div>

        <template v-if="!pending">
          <div v-for="(b, i) in bids" :key="'b' + i" class="relative">
            <div
              class="absolute inset-y-0 left-0 bg-green-500/10"
              :style="{ width: bidPct[i] + '%' }"
            />
            <div class="relative grid grid-cols-3 gap-2 text-xs px-2 py-1 rounded">
              <span class="tabular-nums">${{ Number(b[0]).toLocaleString() }}</span>
              <span class="tabular-nums text-right">{{ Number(b[1]).toLocaleString() }}</span>
              <span class="tabular-nums text-right">{{ cumBid[i].toLocaleString() }}</span>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-for="i in 10" :key="'sk-b' + i" class="h-6 rounded bg-white/10 animate-pulse" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ symbol: string; limit?: 5 | 10 | 20 | 50 | 100; height?: number }>(),
  { limit: 50, height: 300 },
)

const { orderBook } = useBinanceMarket()
const { connect } = useBinanceWS()

const asks = ref<[string, string][]>([])
const bids = ref<[string, string][]>([])
const pending = ref(true)

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
  pending.value = false
}

let stop: (() => void) | null = null

function openWS() {
  if (import.meta.server) return
  stop?.()
  // stream partiel top N niveaux, 100ms
  const path = `${props.symbol.toLowerCase()}@depth${props.limit}@100ms`
  stop = connect(path, {
    onMessage: (m: any) => {
      if (m?.asks && m?.bids) {
        asks.value = m.asks as [string, string][]
        bids.value = m.bids as [string, string][]
        pending.value = false
      }
    },
  })
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
</script>
