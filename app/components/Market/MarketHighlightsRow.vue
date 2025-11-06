<template>
  <div class="flex items-center justify-between rounded-xl px-2 py-2">
    <div class="flex items-center gap-2 min-w-0">
      <ui-coin-logo :asset="row.base" :size="20" class="shrink-0" />
      <span class="font-medium truncate">{{ row.base }}</span>
    </div>
    <div class="text-right">
      <div class="text-sm tabular-nums">{{ moneyCompact(row.last) }}</div>
      <div
        class="text-xs tabular-nums"
        :class="row.chg >= 0 ? 'text-emerald-400' : 'text-rose-400'"
      >
        {{ row.chg >= 0 ? '+' : '' }}{{ row.chg.toFixed(2) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  row: { base: string; last: number; chg: number }
}>()

function moneyCompact(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)
}
</script>
