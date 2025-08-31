<template>
  <div :class="['animate-pulse bg-white/10 rounded-2xl', h]" role="status" :aria-label="title" />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ h?: string; title?: string }>(), {
  h: 'h-32',
  title: '',
})
</script>
