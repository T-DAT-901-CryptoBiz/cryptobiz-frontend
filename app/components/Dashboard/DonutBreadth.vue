<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">Market Breadth</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </header>

    <div v-if="pending" class="space-y-3">
      <div class="h-7 w-28 rounded bg-white/10 animate-pulse"></div>
      <div class="h-12 rounded bg-white/10 animate-pulse"></div>
      <div class="h-4 w-1/2 rounded bg-white/10 animate-pulse"></div>
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-end justify-between">
        <div>
          <div class="text-2xl font-semibold tabular-nums">{{ advPct.toFixed(1) }}%</div>
          <div class="text-xs text-white/60">advancers (of all pairs)</div>
        </div>
        <div class="text-xs text-white/60 text-right">
          <div>Total pairs: {{ totalFmt }}</div>
        </div>
      </div>

      <div class="space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full" style="background-color: #22c55e"></span>
              <span class="font-medium">Advancers</span>
            </span>
            <span class="tabular-nums text-white/70">
              {{ advFmt }}
              <span class="text-white/50 text-xs ml-1">({{ advPct.toFixed(1) }}%)</span>
            </span>
          </div>
          <div class="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              style="background: linear-gradient(180deg, #22c55e, #16a34a); width: 100%"
              :style="{ width: advPct + '%' }"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full" style="background-color: #ef4444"></span>
              <span class="font-medium">Decliners</span>
            </span>
            <span class="tabular-nums text-white/70">
              {{ decFmt }}
              <span class="text-white/50 text-xs ml-1">({{ decPct.toFixed(1) }}%)</span>
            </span>
          </div>
          <div class="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              style="background: linear-gradient(180deg, #ef4444, #b91c1c); width: 100%"
              :style="{ width: decPct + '%' }"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="inline-flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full" style="background-color: #94a3b8"></span>
              <span class="font-medium">Flat</span>
            </span>
            <span class="tabular-nums text-white/70">
              {{ flatFmt }}
              <span class="text-white/50 text-xs ml-1">({{ flatPct.toFixed(1) }}%)</span>
            </span>
          </div>
          <div class="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
              style="background: linear-gradient(180deg, #94a3b8, #64748b); width: 100%"
              :style="{ width: flatPct + '%' }"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAll24h } from '~/composables/useAll24h'

const { rows, pending } = useAll24h()

const adv = computed(() => rows.value.filter((r) => Number(r.priceChangePercent) > 0).length)
const dec = computed(() => rows.value.filter((r) => Number(r.priceChangePercent) < 0).length)
const total = computed(() => rows.value.length)
const flat = computed(() => Math.max(0, total.value - adv.value - dec.value))

const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0)
const advPct = computed(() => Math.max(0, Math.min(100, pct(adv.value, total.value))))
const decPct = computed(() => Math.max(0, Math.min(100, pct(dec.value, total.value))))
const flatPct = computed(() => Math.max(0, Math.min(100, 100 - advPct.value - decPct.value)))

const advFmt = computed(() => adv.value.toLocaleString())
const decFmt = computed(() => dec.value.toLocaleString())
const flatFmt = computed(() => flat.value.toLocaleString())
const totalFmt = computed(() => total.value.toLocaleString())
</script>
