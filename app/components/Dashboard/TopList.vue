<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-2">
      <h3 class="font-semibold">{{ title }}</h3>
      <NuxtLink to="/markets" class="text-xs text-white/60 hover:text-white/90">Markets</NuxtLink>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
          <ui-skeleton-line class="w-40 h-4" />
        </div>
        <ui-skeleton-line class="w-20 h-4" />
      </div>
    </div>

    <ul v-else class="divide-y divide-white/5">
      <li
        v-for="(it, i) in (items || []).slice(0, limit ?? 5)"
        :key="it.symbol"
        class="py-2 flex items-center justify-between"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-5 text-xs text-white/40 tabular-nums text-right">{{ i + 1 }}.</span>
          <ui-coin-logo :asset="baseFromSymbol(it.symbol)" :size="18" />
          <NuxtLink
            :to="`/asset/${it.symbol}`"
            class="font-medium hover:underline truncate"
            :title="it.symbol"
          >
            {{ it.symbol }}
            <span v-if="it.label" class="text-xs text-white/50 ml-1">({{ it.label }})</span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-1">
          <Icon
            v-if="trendIcon(it)"
            :name="trendIcon(it)!"
            class="h-4 w-4"
            :class="it.valueClass"
            aria-hidden="true"
          />
          <span class="tabular-nums text-sm" :class="it.valueClass">{{ it.value }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
type Item = { symbol: string; label?: string; value: string; valueClass?: string }

const props = defineProps<{
  title: string
  items?: Item[]
  loading?: boolean
  limit?: number
}>()

function baseFromSymbol(sym: string): string {
  const q = sym.match(/(USDT|FDUSD|USDC|BUSD|TUSD|USD|PERP)$/)?.[0] ?? ''
  return sym.slice(0, sym.length - q.length) || sym
}

function trendIcon(it: Item): string | null {
  const v = it.value?.trim() || ''
  const cls = it.valueClass || ''
  if (v.startsWith('+') || /emerald|green/i.test(cls)) return 'lucide:arrow-up-right'
  if (v.startsWith('-') || /rose|red/i.test(cls)) return 'lucide:arrow-down-right'
  return 'lucide:dot'
}
</script>
