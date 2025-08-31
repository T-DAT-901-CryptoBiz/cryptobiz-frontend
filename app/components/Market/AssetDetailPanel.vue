<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-4 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">{{ props.symbol }}</h3>
        <p class="text-sm text-white/60">24h</p>
      </div>
      <div class="text-right">
        <p class="text-2xl font-semibold tabular-nums">
          <span v-if="!pending">${{ Number(t?.lastPrice || 0).toLocaleString() }}</span>
          <span v-else class="opacity-50">—</span>
        </p>
        <p
          class="text-sm"
          :class="Number(t?.priceChangePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'"
        >
          {{ Number(t?.priceChangePercent || 0).toFixed(2) }}%
        </p>
      </div>
    </div>

    <ClientOnly>
      <ChartsTvAdvancedChart :symbol="tvSymbol" interval="60" theme="dark" />
      <template #fallback>
        <div
          class="h-[420px] w-full grid place-items-center bg-neutral-900/50 border-t border-white/5"
        >
          <span class="text-white/60 text-sm">Chargement du chart…</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ symbol: string }>()
const tvSymbol = computed(() => `BINANCE:${props.symbol}`)
const { data: t, pending } = useTicker(props.symbol)
</script>
