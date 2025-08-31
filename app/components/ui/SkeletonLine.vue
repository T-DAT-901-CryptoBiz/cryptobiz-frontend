<template>
  <div :class="['animate-pulse bg-white/10', props.w, props.h, props.rounded]" />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ w?: string; h?: string; rounded?: string }>(), {
  w: 'w-full',
  h: 'h-4',
  rounded: 'rounded-md',
})
</script>
