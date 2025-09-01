<template>
  <svg :width="w" :height="h" fill="none" class="overflow-visible">
    <path :d="path" :class="strokeClass" :stroke-width="sw" vector-effect="non-scaling-stroke" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  points: number[]
  width?: number
  height?: number
  strokeWidth?: number
  positive?: boolean | null
}>()

const w = computed(() => props.width ?? 120)
const h = computed(() => props.height ?? 32)
const sw = computed(() => props.strokeWidth ?? 2)

const path = computed(() => {
  const arr = props.points
  if (!arr?.length) return ''
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min))
  const step = arr.length > 1 ? w.value / (arr.length - 1) : 0
  return arr
    .map((v, i) => {
      const x = i * step
      const y = h.value - norm(v) * h.value
      return `${i ? 'L' : 'M'}${x},${y}`
    })
    .join(' ')
})

const strokeClass = computed(() => {
  if (props.positive === null || props.positive === undefined) return 'stroke-white/60'
  return props.positive ? 'stroke-green-400' : 'stroke-red-400'
})
</script>
