<template>
  <aside class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">24h Stats</h3>
      <div
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
        :class="chg >= 0 ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'"
      >
        <Icon
          :name="chg >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'"
          class="h-3.5 w-3.5"
        />
        <span class="tabular-nums">{{ pending ? '—' : chg.toFixed(2) + '%' }}</span>
      </div>
    </div>

    <div class="p-4 space-y-5">
      <div>
        <div class="text-sm text-white/60 mb-1">Last Price</div>
        <div class="text-2xl font-semibold tabular-nums">
          <span v-if="!pending">${{ money(last) }}</span>
          <span v-else class="inline-block h-6 w-32 rounded bg-white/10 animate-pulse" />
        </div>

        <div class="mt-3">
          <div class="flex items-center justify-between text-xs text-white/60 mb-1">
            <span>Low: ${{ money(low) }}</span>
            <span>High: ${{ money(high) }}</span>
          </div>
          <div class="relative h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              class="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-red-500/20"
              :style="{ width: '100%' }"
            />
            <div
              class="absolute -top-1.5 h-5 w-1.5 rounded bg-white/80"
              :style="{ left: marker + '%' }"
              aria-hidden="true"
            />
          </div>
          <div class="mt-1 text-xs text-white/50">24h range</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-xl border border-white/10 p-3 bg-white/5">
          <div class="text-white/60 text-xs">High (24h)</div>
          <div class="tabular-nums mt-0.5">
            <span v-if="!pending">${{ money(high) }}</span>
            <span v-else class="inline-block h-4 w-20 rounded bg-white/10 animate-pulse" />
          </div>
        </div>

        <div class="rounded-xl border border-white/10 p-3 bg-white/5">
          <div class="text-white/60 text-xs">Low (24h)</div>
          <div class="tabular-nums mt-0.5">
            <span v-if="!pending">${{ money(low) }}</span>
            <span v-else class="inline-block h-4 w-20 rounded bg-white/10 animate-pulse" />
          </div>
        </div>

        <div class="rounded-xl border border-white/10 p-3 bg-white/5">
          <div class="text-white/60 text-xs">Quote Volume (24h)</div>
          <div class="tabular-nums mt-0.5">
            <span v-if="!pending">${{ compact(quoteVol) }}</span>
            <span v-else class="inline-block h-4 w-24 rounded bg-white/10 animate-pulse" />
          </div>
        </div>

        <div class="rounded-xl border border-white/10 p-3 bg-white/5">
          <div class="text-white/60 text-xs">Base Volume (24h)</div>
          <div class="tabular-nums mt-0.5">
            <span v-if="!pending">{{ compact(baseVol) }}</span>
            <span v-else class="inline-block h-4 w-24 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      <div class="pt-2">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold text-sm">Top Pairs ({{ base }})</h4>
          <NuxtLink :to="`/markets?q=${base}`" class="text-xs text-white/60 hover:text-white/90"
            >Explore
          </NuxtLink>
        </div>

        <div v-if="pairsPending" class="space-y-2">
          <div v-for="i in 3" :key="i" class="h-8 rounded bg-white/10 animate-pulse" />
        </div>

        <ul v-else class="space-y-2 text-sm">
          <li
            v-for="p in topPairs"
            :key="p.symbol"
            class="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <NuxtLink :to="`/asset/${p.symbol}`" class="flex items-center gap-2">
              <ui-coin-logo :asset="base" :size="18" />
              <span class="font-medium">{{ p.symbol }}</span>
            </NuxtLink>
            <span class="text-white/60 tabular-nums"
              >${{ compact(Number(p.quoteVolume || 0)) }}</span
            >
          </li>
        </ul>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{ symbol: string }>()
const base = computed(() => props.symbol.replace(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/, ''))

const { data: t, pending } = useTicker(props.symbol)

const last = computed(() => Number(t.value?.lastPrice ?? 0))
const high = computed(() => Number(t.value?.highPrice ?? 0))
const low = computed(() => Number(t.value?.lowPrice ?? 0))
const chg = computed(() => Number(t.value?.priceChangePercent ?? 0))
const quoteVol = computed(() => Number(t.value?.quoteVolume ?? 0))
const baseVol = computed(() => Number(t.value?.volume ?? 0))

const marker = computed(() => {
  const lo = low.value,
    hi = high.value,
    l = last.value
  const span = Math.max(hi - lo, 1e-12)
  const pct = ((l - lo) / span) * 100
  return Math.min(100, Math.max(0, pct))
})

const { rows, pending: allPending } = useAll24h()
const { maps } = useSymbolsUniverse()
const pairsPending = computed(() => allPending.value)

const topPairs = computed(() => {
  const list = rows.value.filter((r) => maps.value.base[r.symbol] === base.value)
  return [...list]
    .sort((a, b) => Number(b.quoteVolume || 0) - Number(a.quoteVolume || 0))
    .slice(0, 5)
})

const money = (n: number) => (n ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0')

const compactFmt = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 2,
})
const compact = (n: number) => compactFmt.format(n || 0)
</script>
