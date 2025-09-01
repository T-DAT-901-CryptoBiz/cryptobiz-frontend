<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-3">
    <div class="mb-2 text-sm text-white/60">Performance</div>
    <div class="flex flex-wrap gap-2">
      <div
        v-for="p in perf"
        :key="p.label"
        class="px-3 py-2 rounded-xl text-sm flex items-center gap-2 border border-white/10"
        :class="
          p.loading
            ? 'bg-white/5'
            : p.value >= 0
              ? 'bg-green-500/10 text-green-300'
              : 'bg-red-500/10 text-red-300'
        "
      >
        <span class="text-white/70">{{ p.label }}</span>
        <span class="tabular-nums font-medium">{{
          p.loading ? '—' : p.value.toFixed(2) + '%'
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useKlines } from '~/composables/useKlines'

import type { Interval } from '~/types/binance'

const props = defineProps<{ symbol: string }>()

const makeChange = (arr: number[]) => {
  if (arr.length < 2) return 0
  const first = arr[0]
  const last = arr[arr.length - 1]
  return (last / first - 1) * 100
}

const mk = (interval: Interval, limit: number) => {
  const { candles, refresh } = useKlines(props.symbol, interval, limit)
  const ready = ref(false)
  onMounted(async () => {
    await refresh()
    ready.value = true
  })
  const change = computed(() => (ready.value ? makeChange(candles.value.map((c) => c.close)) : 0))
  return { change, ready }
}

const h1 = mk('1h', 25)
const h4 = mk('4h', 43)
const d1 = mk('1d', 8)
const d7 = mk('1d', 31)

const perf = computed(() => [
  { label: '24h', value: h1.change.value, loading: !h1.ready.value },
  { label: '7d', value: h4.change.value, loading: !h4.ready.value },
  { label: '1m', value: d7.change.value, loading: !d7.ready.value },
  { label: '1y', value: d1.change.value, loading: !d1.ready.value },
])
</script>
