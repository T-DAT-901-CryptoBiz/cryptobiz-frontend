<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="text-xs text-white/60">Total: {{ total.toLocaleString() }} items</div>
    <div class="flex items-center gap-2">
      <select
        class="text-sm bg-neutral-900/70 border border-white/10 rounded-lg px-2 py-1"
        :value="perPage"
        @change="emit('update:perPage', Number(($event.target as HTMLSelectElement).value))"
      >
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <button
        class="px-2 py-1 rounded bg-white/10 disabled:opacity-40"
        :disabled="!canPrev"
        @click="emit('update:page', page - 1)"
      >
        Prev
      </button>
      <span class="text-sm">{{ page }} / {{ pageCount }}</span>
      <button
        class="px-2 py-1 rounded bg-white/10 disabled:opacity-40"
        :disabled="!canNext"
        @click="emit('update:page', page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ page: number; total: number; perPage: number }>(), {
  page: 1,
  total: 0,
  perPage: 50,
})
const emit = defineEmits<{
  'update:page': [number]
  'update:perPage': [number]
}>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
const canPrev = computed(() => props.page > 1)
const canNext = computed(() => props.page < pageCount.value)
</script>
