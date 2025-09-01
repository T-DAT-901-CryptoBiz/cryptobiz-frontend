<template>
  <NuxtLink
    :to="to || '/markets'"
    class="group rounded-2xl bg-neutral-900/60 p-4 border border-white/5 hover:border-white/20 transition-colors block"
  >
    <div class="flex items-start justify-between">
      <p class="text-xs text-white/60">{{ title }}</p>
      <span class="text-xs text-white/40 group-hover:text-white/70">See more →</span>
    </div>

    <div class="mt-2">
      <template v-if="loading">
        <ui-skeleton-line class="w-40 h-7" />
        <ui-skeleton-line class="w-24 h-4 mt-2" />
      </template>
      <template v-else>
        <p class="text-2xl font-semibold tabular-nums">
          {{ typeof value === 'number' ? value.toLocaleString() : value }}
        </p>
        <p v-if="sub" class="text-xs text-white/50 mt-1">{{ sub }}</p>
      </template>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value?: string | number
  sub?: string
  to?: string
  loading?: boolean
}>()
</script>
