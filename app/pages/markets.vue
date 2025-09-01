<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <input
        v-model="q"
        placeholder="Search for a symbol (e.g., BTCUSDT)…"
        class="w-full max-w-sm rounded-xl bg-neutral-900/70 border border-white/10 px-3 py-2 text-sm"
      />
    </div>
    <MarketTablePro :symbols="filtered" :page-size="20" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'

const q = ref('')

const { universe } = useSymbolsUniverse()

const filtered = computed<string[]>(() => {
  const s = q.value.trim().toLowerCase()
  const arr = universe.value
  return s ? arr.filter((x) => x.toLowerCase().includes(s)) : arr
})
</script>
