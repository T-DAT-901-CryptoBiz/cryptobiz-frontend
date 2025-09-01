<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Market Heatmap (24h)</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </div>

    <div v-if="pending" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      <UiSkeletonBlock v-for="i in 24" :key="i" class="h-16" />
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      <NuxtLink
        v-for="t in tiles"
        :key="t.symbol"
        :to="`/asset/${t.symbol}`"
        class="rounded-xl p-2 border border-white/5 hover:border-white/20 transition-colors"
        :style="{
          backgroundColor: `color-mix(in oklab, hsl(${t.hue} 60% 50%) ${Math.round(t.alpha * 100)}%, transparent)`,
        }"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="font-medium">{{ t.symbol }}</span>
          <span :class="t.pct >= 0 ? 'text-green-200' : 'text-red-200'">
            {{ t.pct.toFixed(2) }}%
          </span>
        </div>
        <div class="mt-1 text-[13px] tabular-nums">${{ t.price.toLocaleString() }}</div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAll24h } from '~/composables/useAll24h'

const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 24 })

const { rows, pending } = useAll24h()

const tiles = computed(() => {
  return [...rows.value]
    .sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume))
    .slice(0, props.limit)
    .map((r) => {
      const pct = Number(r.priceChangePercent || 0)
      return {
        symbol: r.symbol,
        price: Number(r.lastPrice || 0),
        pct,
        hue: pct >= 0 ? 150 : 0,
        alpha: Math.min(0.9, Math.abs(pct) / 10 + 0.15),
      }
    })
})
</script>
