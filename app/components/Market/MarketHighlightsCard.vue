<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
    <div class="flex items-center justify-between mb-2">
      <div class="text-white/80 text-sm">{{ title }}</div>
      <NuxtLink
        :to="to"
        class="text-xs text-white/60 hover:text-white/80 inline-flex items-center gap-1"
      >
        Plus <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
      </NuxtLink>
    </div>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 3" :key="i" class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
          <div class="h-3 w-16 rounded bg-white/10 animate-pulse" />
        </div>
        <div class="h-3 w-24 rounded bg-white/10 animate-pulse" />
      </div>
    </div>

    <slot v-else />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  to?: string
  loading?: boolean
}>()
</script>
