<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-semibold">{{ title }}</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="flex items-center justify-between">
        <ui-skeleton-line class="w-40 h-4" />
        <ui-skeleton-line class="w-20 h-4" />
      </div>
    </div>

    <ul v-else class="divide-y divide-white/5">
      <li
        v-for="(it, i) in (items || []).slice(0, limit ?? 5)"
        :key="it.symbol"
        class="py-2 flex items-center justify-between"
      >
        <NuxtLink :to="`/asset/${it.symbol}`" class="font-medium hover:underline">
          {{ i + 1 }}. {{ it.symbol }}
          <span v-if="it.label" class="text-xs text-white/50 ml-1">({{ it.label }})</span>
        </NuxtLink>
        <span class="tabular-nums text-sm" :class="it.valueClass">{{ it.value }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  items?: { symbol: string; label?: string; value: string; valueClass?: string }[]
  loading?: boolean
  limit?: number
}>()
</script>
