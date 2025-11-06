<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3 min-w-0">
      <div
        v-if="avatar"
        class="rounded-full bg-white/10 animate-pulse shrink-0"
        :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }"
      />
      <div class="space-y-1">
        <div
          v-for="i in lines"
          :key="i"
          class="h-3 rounded bg-white/10 animate-pulse"
          :class="lineWidth(i)"
        />
      </div>
    </div>

    <div class="flex flex-col items-end gap-1">
      <div class="h-3 w-16 rounded bg-white/10 animate-pulse" />
      <div class="h-3 w-10 rounded bg-white/10 animate-pulse" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    avatar?: boolean
    avatarSize?: number
    lines?: number
  }>(),
  { avatar: false, avatarSize: 24, lines: 2 },
)

function lineWidth(i: number) {
  if (props.lines <= 1) return 'w-24'
  if (i === 1) return 'w-28'
  if (i === props.lines) return 'w-16'
  return 'w-24'
}
</script>
