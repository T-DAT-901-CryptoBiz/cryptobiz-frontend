<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-3">
      <slot name="title"><h3 class="font-semibold">Donut</h3></slot>
      <slot name="cta"></slot>
    </div>

    <div v-if="loading" class="flex items-center gap-6">
      <div :style="{ width: size + 'px' }" class="shrink-0">
        <div
          :style="{ width: size + 'px', height: size + 'px' }"
          class="rounded-full overflow-hidden"
        >
          <div class="w-full h-full animate-pulse bg-white/10" />
        </div>
      </div>
      <div class="flex-1 space-y-2">
        <div v-for="i in 6" :key="i" class="h-5 rounded-md bg-white/10 animate-pulse" />
      </div>
    </div>

    <div v-else class="flex items-center gap-6">
      <div
        class="relative shrink-0"
        :style="{ width: size + 'px', height: size + 'px' }"
        role="img"
      >
        <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
          <circle
            :cx="size / 2"
            :cy="size / 2"
            :r="radius"
            class="stroke-white/10 fill-none"
            :stroke-width="thickness"
          />
          <g :transform="`rotate(-90 ${size / 2} ${size / 2})`">
            <circle
              v-for="s in segments"
              :key="s.label"
              :cx="size / 2"
              :cy="size / 2"
              :r="radius"
              :stroke="s.color"
              fill="none"
              :stroke-width="thickness"
              :stroke-linecap="rounded ? 'round' : 'butt'"
              :stroke-dasharray="`${s.len} ${Math.max(0, C - s.len)}`"
              :stroke-dashoffset="s.offset"
              class="transition-[stroke-dasharray,stroke-dashoffset] duration-700 ease-out"
            />
          </g>
        </svg>

        <div class="absolute inset-0 grid place-items-center text-center pointer-events-none">
          <slot name="center">
            <div>
              <div class="text-2xl font-semibold tabular-nums">{{ fmt(total) }}</div>
              <div class="text-xs text-white/60">
                <slot name="center-sub">Total</slot>
              </div>
            </div>
          </slot>
        </div>
      </div>

      <div v-if="showLegend" class="flex-1 space-y-2">
        <div v-for="s in segments" :key="s.label" class="flex items-center justify-between text-sm">
          <div class="flex items-center gap-2">
            <span class="inline-block h-3 w-3 rounded" :style="{ background: s.color }"></span>
            <span class="font-medium">{{ s.label }}</span>
          </div>
          <div class="tabular-nums">
            {{ s.pct.toFixed(1) }}%
            <span class="text-white/50 ml-1">• {{ fmt(Math.round(s.value)) }}</span>
          </div>
        </div>
        <div v-if="!segments.length" class="text-sm text-white/60">Aucune donnée</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    data: { label: string; value: number; color?: string }[]
    size?: number
    thickness?: number
    rounded?: boolean
    showLegend?: boolean
    loading?: boolean
  }>(),
  {
    size: 160,
    thickness: 18,
    rounded: true,
    showLegend: true,
    loading: false,
  },
)

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)

const total = computed(
  () => props.data?.reduce((a, d) => a + Math.max(0, Number(d.value || 0)), 0) || 0,
)

const radius = computed(() => Math.max(0, props.size / 2 - props.thickness / 2))
const C = computed(() => Math.PI * 2 * radius.value)

type Seg = { label: string; value: number; color: string; len: number; offset: number; pct: number }
const fallback = [
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#f472b6',
  '#a78bfa',
  '#f87171',
  '#22d3ee',
  '#c084fc',
  '#f59e0b',
  '#10b981',
]

const segments = computed<Seg[]>(() => {
  if (!total.value) return []
  let offset = 0
  return props.data
    .filter((d) => Number(d.value) > 0)
    .map((d, i) => {
      const pct = Number(d.value) / total.value
      const len = pct * C.value
      const seg: Seg = {
        label: d.label,
        value: Number(d.value),
        color: d.color || fallback[i % fallback.length],
        len,
        offset,
        pct: pct * 100,
      }
      offset += len
      return seg
    })
})
</script>
