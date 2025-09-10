<template>
  <div
    class="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-4"
    role="group"
    aria-labelledby="ticker-title"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 min-w-0">
        <ui-coin-logo :asset="base" :size="20" />
        <h3 id="ticker-title" class="text-sm font-medium truncate">
          <span class="text-white/90">{{ base }}</span>
          <span class="text-white/50">/{{ quote }}</span>
        </h3>
      </div>

      <span
        class="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-white/70 ring-1 ring-white/10"
        title="24h change"
      >
        24h
      </span>
    </div>

    <div class="mt-3">
      <p class="text-2xl font-semibold tabular-nums leading-none">
        <span v-if="!pending">${{ priceFmt }}</span>
        <span v-else class="inline-block h-7 w-28 rounded bg-white/10 animate-pulse" />
      </p>

      <p
        v-if="!pending"
        class="mt-1 text-sm font-semibold inline-flex items-center gap-1.5"
        :class="pct24 >= 0 ? 'text-emerald-400' : 'text-rose-400'"
      >
        <Icon
          :name="pct24 >= 0 ? 'lucide:arrow-up-right' : 'lucide:arrow-down-right'"
          class="h-4 w-4"
        />
        <span class="tabular-nums">{{ signPct }}</span>
        <span class="text-white/50 tabular-nums"> ({{ changeAbsSign }}) </span>
      </p>

      <div v-else class="mt-2 h-4 w-20 rounded bg-white/10 animate-pulse" />
    </div>

    <div class="mt-3">
      <div class="flex items-center justify-between text-[11px] text-white/60 mb-1.5">
        <span>24h Low</span>
        <span>24h High</span>
      </div>

      <div class="relative h-2 w-full rounded bg-white/10 overflow-hidden">
        <div
          v-if="!pending"
          class="absolute inset-y-0 left-0 rounded bg-white/20"
          :style="{ width: rangeFill + '%' }"
          aria-hidden="true"
        />
        <div
          v-if="!pending"
          class="absolute -top-1.5 h-5 w-1.5 rounded bg-white"
          :style="{ left: nowPos + '%' }"
          aria-label="Current price position in 24h range"
        />
        <div v-else class="h-full w-1/2 bg-white/15 animate-pulse"></div>
      </div>

      <div
        v-if="!pending"
        class="mt-1 flex items-center justify-between text-[11px] text-white/60 tabular-nums"
      >
        <span>${{ lowFmt }}</span>
        <span>${{ highFmt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTicker } from '~/composables/useTicker'

const props = defineProps<{ symbol: string }>()

const SUFFIX = /(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/i
const base = computed(() => String(props.symbol || '').replace(SUFFIX, '') || '—')
const quote = computed(() => (props.symbol.match(SUFFIX)?.[0] || '').toUpperCase() || 'USDT')

const { data: t, pending } = useTicker(props.symbol)

const num = (v: unknown, d = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}
const fmtPrice = (v: number) => {
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (v >= 1) return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (v >= 0.01) return v.toLocaleString(undefined, { maximumFractionDigits: 4 })
  return v.toLocaleString(undefined, { maximumFractionDigits: 8 })
}

const last = computed(() => num(t.value?.lastPrice))
const open = computed(() => num(t.value?.openPrice))
const high = computed(() => num(t.value?.highPrice))
const low = computed(() => num(t.value?.lowPrice))

const pct24 = computed(() => {
  const apiPct = t.value?.priceChangePercent
  if (apiPct != null) return num(apiPct)
  return open.value ? ((last.value - open.value) / open.value) * 100 : 0
})

const changeAbs = computed(() => last.value - open.value)

const priceFmt = computed(() => fmtPrice(last.value))
const lowFmt = computed(() => fmtPrice(low.value))
const highFmt = computed(() => fmtPrice(high.value))
const signPct = computed(() => `${pct24.value >= 0 ? '+' : ''}${pct24.value.toFixed(2)}%`)
const changeAbsSign = computed(() => {
  const s = changeAbs.value >= 0 ? '+' : ''
  return `${s}$${fmtPrice(Math.abs(changeAbs.value))}`
})

const rangeFill = computed(() => {
  const span = Math.max(0, high.value - low.value)
  return span > 0 ? 100 : 0
})
const nowPos = computed(() => {
  const span = Math.max(0, high.value - low.value)
  if (span <= 0) return 0
  const pos = ((last.value - low.value) / span) * 100
  return Math.max(0, Math.min(100, pos))
})
</script>
