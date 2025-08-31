<template>
  <div
    class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
    :style="{ height: height + 'px' }"
  >
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">Bid / Ask</h3>
      <div class="text-xs text-white/50">Realtime</div>
    </div>

    <div class="p-4 grid grid-cols-2 gap-4">
      <div>
        <div class="text-xs text-white/60 mb-1">Best Bid</div>
        <div class="text-2xl font-semibold tabular-nums text-green-400">
          <span v-if="!pending">${{ bid.toLocaleString() }}</span
          ><span v-else>—</span>
        </div>
        <div class="text-xs text-white/50">Qty: {{ bidQty.toLocaleString() }}</div>
      </div>
      <div class="text-right">
        <div class="text-xs text-white/60 mb-1">Best Ask</div>
        <div class="text-2xl font-semibold tabular-nums text-red-400">
          <span v-if="!pending">${{ ask.toLocaleString() }}</span
          ><span v-else>—</span>
        </div>
        <div class="text-xs text-white/50">Qty: {{ askQty.toLocaleString() }}</div>
      </div>
      <div class="col-span-2 flex items-center justify-between border-t border-white/5 pt-3 mt-1">
        <div class="text-sm text-white/60">Spread</div>
        <div class="text-right">
          <div class="font-semibold tabular-nums">${{ spreadAbs.toLocaleString() }}</div>
          <div class="text-xs text-white/60 tabular-nums">{{ spreadBps.toFixed(2) }} bps</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ symbol: string; height?: number }>(), { height: 160 })
const { connect } = useBinanceWS()

const bid = ref(0)
const ask = ref(0)
const bidQty = ref(0)
const askQty = ref(0)
const pending = ref(true)

const spreadAbs = computed(() => Math.max(0, ask.value - bid.value))
const spreadBps = computed(() => {
  const mid = (ask.value + bid.value) / 2 || 1
  return (spreadAbs.value / mid) * 10_000
})

let stop: (() => void) | null = null

function open() {
  if (import.meta.server) return
  stop?.()
  stop = connect(`${props.symbol.toLowerCase()}@bookTicker`, {
    onMessage: (m: any) => {
      if (!m?.b || !m?.a) return
      bid.value = Number(m.b)
      ask.value = Number(m.a)
      bidQty.value = Number(m.B || 0)
      askQty.value = Number(m.A || 0)
      pending.value = false
    },
  })
}

onMounted(open)
onBeforeUnmount(() => stop?.())
watch(() => props.symbol, open)
</script>
