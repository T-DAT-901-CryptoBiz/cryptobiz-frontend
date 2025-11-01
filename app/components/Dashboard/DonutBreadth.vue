<template>
  <section class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <header class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">Market Breadth</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </header>

    <div v-if="pending" class="space-y-4">
      <div class="h-5 w-28 rounded bg-white/10 animate-pulse" />
      <div class="grid grid-cols-3 gap-8">
        <div v-for="i in 3" :key="i" class="h-44 w-11 rounded-full bg-white/10 animate-pulse" />
      </div>
      <div class="h-6 rounded-full bg-white/10 animate-pulse" />
    </div>

    <div v-else class="space-y-6">
      <div class="flex items-end justify-between">
        <div>
          <div class="text-2xl font-semibold tabular-nums">{{ advPct.toFixed(1) }}%</div>
          <div class="text-xs text-white/60">advancers (of all pairs)</div>
        </div>
        <div class="text-xs text-white/60">Total pairs: {{ totalFmt }}</div>
      </div>

      <div
        class="grid grid-cols-3 gap-8"
        role="img"
        :aria-label="`Advancers ${advPct.toFixed(1)}%, Decliners ${decPct.toFixed(1)}%, Flat ${flatPct.toFixed(1)}%`"
      >
        <div class="flex flex-col items-center gap-2">
          <div
            class="relative w-11 h-44 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/10"
          >
            <div
              class="absolute bottom-0 left-0 right-0 rounded-t-[14px] shadow-[0_0_12px_rgba(34,197,94,.35)] transition-[height] duration-700"
              :style="{
                height: advPct + '%',
                background: 'linear-gradient(180deg,#22c55e,#16a34a)',
              }"
              :title="`Advancers: ${advFmt} (${advPct.toFixed(1)}%)`"
            />
          </div>
          <div class="text-center">
            <div class="text-xs text-white/60">Adv</div>
            <div class="text-sm font-medium tabular-nums">{{ advPct.toFixed(1) }}%</div>
          </div>
        </div>

        <div class="flex flex-col items-center gap-2">
          <div
            class="relative w-11 h-44 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/10"
          >
            <div
              class="absolute bottom-0 left-0 right-0 rounded-t-[14px] shadow-[0_0_12px_rgba(239,68,68,.35)] transition-[height] duration-700 delay-100"
              :style="{
                height: decPct + '%',
                background: 'linear-gradient(180deg,#ef4444,#b91c1c)',
              }"
              :title="`Decliners: ${decFmt} (${decPct.toFixed(1)}%)`"
            />
          </div>
          <div class="text-center">
            <div class="text-xs text-white/60">Dec</div>
            <div class="text-sm font-medium tabular-nums">{{ decPct.toFixed(1) }}%</div>
          </div>
        </div>

        <div class="flex flex-col items-center gap-2">
          <div
            class="relative w-11 h-44 rounded-full bg-white/10 overflow-hidden ring-1 ring-white/10"
          >
            <div
              class="absolute bottom-0 left-0 right-0 rounded-t-[14px] shadow-[0_0_12px_rgba(148,163,184,.35)] transition-[height] duration-700 delay-200"
              :style="{
                height: flatPct + '%',
                background: 'linear-gradient(180deg,#94a3b8,#64748b)',
              }"
              :title="`Flat: ${flatFmt} (${flatPct.toFixed(1)}%)`"
            />
          </div>
          <div class="text-center">
            <div class="text-xs text-white/60">Flat</div>
            <div class="text-sm font-medium tabular-nums">{{ flatPct.toFixed(1) }}%</div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs text-white/80">
        <span
          class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 ring-1 ring-white/10"
        >
          <span class="h-2.5 w-2.5 rounded-full" style="background: #22c55e"></span>
          <span class="font-medium">Advancers</span>
          <span class="tabular-nums text-white/70">{{ advFmt }}</span>
          <span class="text-white/50">({{ advPct.toFixed(1) }}%)</span>
        </span>
        <span
          class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 ring-1 ring-white/10"
        >
          <span class="h-2.5 w-2.5 rounded-full" style="background: #ef4444"></span>
          <span class="font-medium">Decliners</span>
          <span class="tabular-nums text-white/70">{{ decFmt }}</span>
          <span class="text-white/50">({{ decPct.toFixed(1) }}%)</span>
        </span>
        <span
          class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 ring-1 ring-white/10"
        >
          <span class="h-2.5 w-2.5 rounded-full" style="background: #94a3b8"></span>
          <span class="font-medium">Flat</span>
          <span class="tabular-nums text-white/70">{{ flatFmt }}</span>
          <span class="text-white/50">({{ flatPct.toFixed(1) }}%)</span>
        </span>
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
