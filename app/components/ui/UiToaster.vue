<template>
  <div class="fixed z-[100] top-4 right-4 space-y-2 pointer-events-none">
    <div
      v-for="t in queue"
      :key="t.id"
      class="pointer-events-auto rounded-lg px-3 py-2 text-sm shadow border"
      :class="cls(t.type)"
    >
      {{ t.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useState } from '#app'
const queue = useState<any[]>('toast:queue', () => [])
function cls(type: 'success' | 'error' | 'info') {
  if (type === 'success') return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
  if (type === 'error') return 'bg-rose-500/15 border-rose-500/30 text-rose-200'
  return 'bg-white/10 border-white/20 text-white/90'
}
</script>
