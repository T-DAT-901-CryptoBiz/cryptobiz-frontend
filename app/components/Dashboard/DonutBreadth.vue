<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Market Breadth</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </header>

    <div v-if="pending" class="space-y-3">
      <div class="h-7 w-28 rounded bg-white/10 animate-pulse"></div>
      <div class="h-2 rounded bg-white/10 animate-pulse"></div>
      <div class="flex items-center justify-between text-xs text-white/60">
        <div class="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
        <div class="h-4 w-20 rounded bg-white/10 animate-pulse"></div>
      </div>
      <div class="flex items-center justify-between text-xs text-white/60">
        <div class="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
        <div class="h-4 w-20 rounded bg-white/10 animate-pulse"></div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div class="flex items-end justify-between">
        <div>
          <div class="text-2xl font-semibold tabular-nums">{{ advPct.toFixed(1) }}%</div>
          <div class="text-xs text-white/60">advancers (of all pairs)</div>
        </div>
        <div class="text-xs text-white/60">Total: {{ totalFmt }}</div>
      </div>

      <div class="flex h-2 w-full overflow-hidden rounded bg-white/10" aria-label="Market breadth">
        <div class="h-full" :style="{ width: advPct + '%', backgroundColor: colors.adv }"></div>
        <div class="h-full" :style="{ width: decPct + '%', backgroundColor: colors.dec }"></div>
        <div class="h-full" :style="{ width: flatPct + '%', backgroundColor: colors.flat }"></div>
      </div>

      <ul class="text-xs text-white/80 space-y-1.5">
        <li class="flex items-center justify-between">
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colors.adv }"></span>
            Advancers
          </span>
          <span class="tabular-nums"> {{ advFmt }} ({{ advPct.toFixed(1) }}%) </span>
        </li>
        <li class="flex items-center justify-between">
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colors.dec }"></span>
            Decliners
          </span>
          <span class="tabular-nums"> {{ decFmt }} ({{ decPct.toFixed(1) }}%) </span>
        </li>
        <li class="flex items-center justify-between text-white/70">
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colors.flat }"></span>
            Flat
          </span>
          <span class="tabular-nums"> {{ flatFmt }} ({{ flatPct.toFixed(1) }}%) </span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAll24h } from '~/composables/useAll24h'

const { rows, pending } = useAll24h()

const adv = computed(() => rows.value.filter((r: any) => Number(r.priceChangePercent) > 0).length)
const dec = computed(() => rows.value.filter((r: any) => Number(r.priceChangePercent) < 0).length)
const total = computed(() => rows.value.length)
const flat = computed(() => Math.max(0, total.value - adv.value - dec.value))

const toPct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0)
const advPct = computed(() => toPct(adv.value, total.value))
const decPct = computed(() => toPct(dec.value, total.value))
const flatPct = computed(() => Math.max(0, 100 - advPct.value - decPct.value))

const advFmt = computed(() => adv.value.toLocaleString())
const decFmt = computed(() => dec.value.toLocaleString())
const flatFmt = computed(() => flat.value.toLocaleString())
const totalFmt = computed(() => total.value.toLocaleString())

const colors = {
  adv: '#22c55e',
  dec: '#ef4444',
  flat: '#94a3b8',
}
</script>
