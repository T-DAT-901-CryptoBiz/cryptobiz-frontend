<template>
  <label class="inline-flex items-center gap-2 text-sm">
    <input
      type="checkbox"
      class="accent-white/80"
      :checked="props.modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    Only watchlist
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>
