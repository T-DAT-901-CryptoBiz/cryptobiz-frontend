<template>
  <div class="flex items-center justify-between text-xs text-white/60">
    <div>
      Total: <b class="text-white/80">{{ fmt(total) }}</b> pairs
    </div>
    <div v-if="lastUpdated">Last update: {{ new Date(lastUpdated).toLocaleTimeString() }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ total: number; lastUpdated?: Date | null }>()
const fmt = (n: number) => n.toLocaleString()
</script>
