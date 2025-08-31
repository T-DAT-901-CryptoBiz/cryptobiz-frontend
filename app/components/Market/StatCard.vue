<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs text-white/60">{{ title }}</p>
        <p class="mt-1 text-lg font-semibold tabular-nums">{{ value }}</p>
        <p v-if="sub" class="text-xs text-white/50 mt-1">{{ sub }}</p>
      </div>
      <ChartsSparkline
        v-if="points?.length"
        :points="points"
        :positive="trend === 'up' ? true : trend === 'down' ? false : null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  sub?: string
  points?: number[]
  trend?: 'up' | 'down' | 'flat'
}>()
</script>
