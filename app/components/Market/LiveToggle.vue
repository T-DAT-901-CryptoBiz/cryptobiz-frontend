<template>
  <select
    class="text-sm bg-neutral-900/70 border border-white/10 rounded-lg px-2 py-1"
    :value="props.modelValue"
    @change="emit('update:modelValue', Number(($event.target as HTMLSelectElement).value))"
  >
    <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
  </select>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [number] }>()
const options = [
  { label: 'Live: Off', value: 0 },
  { label: '15s', value: 15000 },
  { label: '60s', value: 60000 },
]
</script>
