<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="q in QUOTES"
      :key="q"
      class="px-3 py-1.5 rounded-lg text-sm border border-white/10 hover:border-white/30"
      :class="modelValue === q ? 'bg-white/10' : ''"
      @click="emit('update:modelValue', q)"
    >
      {{ q }}
      <span v-if="counts[q]" class="ml-1 text-white/50">({{ counts[q] }})</span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: string; counts: Record<string, number> }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const QUOTES = ['ALL', 'USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD']
</script>
