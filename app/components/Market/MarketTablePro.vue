<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <div class="text-sm text-white/70">All Crypto</div>

      <div class="text-xs text-white/50">
        <template v-if="isUniverseLoading">
          <span class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
        </template>
        <template v-else> Rows: {{ pool.length.toLocaleString() }}</template>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-sm" :aria-busy="isPageLoading">
        <thead class="text-white/60">
          <tr class="[&>th]:px-4 [&>th]:py-3 text-left">
            <th>#</th>
            <th>Asset</th>
            <th class="cursor-pointer" @click="setSort('price')">Price</th>
            <th class="cursor-pointer" @click="setSort('ch24')">24h %</th>
            <th class="cursor-pointer" @click="setSort('vol24')">24h Volume</th>
            <th>7d Chart</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(r, i) in sorted"
            :key="r.symbol"
            class="border-t border-white/5 hover:bg-white/5"
          >
            <td class="px-4 py-3">{{ start + i + 1 }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <ui-coin-logo
                  :asset="
                    maps.base[r.symbol] || r.symbol.replace(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/, '')
                  "
                  :size="20"
                />
                <NuxtLink :to="`/asset/${r.symbol}`" class="font-medium hover:underline">
                  {{
                    maps.base[r.symbol] || r.symbol.replace(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/, '')
                  }}
                </NuxtLink>
                <span class="text-xs text-white/50"
                  >/{{
                    maps.quote[r.symbol] || r.symbol.match(/USDT|FDUSD|USDC|BUSD|TUSD|USD$/)?.[0]
                  }}</span
                >
              </div>
              <div class="text-xs text-white/40">{{ r.symbol }}</div>
            </td>
            <td class="px-4 py-3 tabular-nums">${{ r.price.toLocaleString() }}</td>
            <td class="px-4 py-3">
              <span :class="r.ch24 >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ r.ch24.toFixed(2) }}%
              </span>
            </td>
            <td class="px-4 py-3 tabular-nums">${{ Math.round(r.vol24).toLocaleString() }}</td>
            <td class="px-4 py-3">
              <ChartsSparkline
                :points="r.spark"
                :positive="r.spark.at(-1)! >= r.spark[0]"
                :width="160"
                :height="36"
              />
            </td>
          </tr>

          <tr v-for="i in missingCount" :key="'sk-' + i" class="border-t border-white/5">
            <td class="px-4 py-3">
              <div class="h-4 w-8 rounded bg-white/10 animate-pulse"></div>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="h-5 w-5 rounded-full bg-white/10 animate-pulse"></div>
                <div class="h-4 w-28 rounded bg-white/10 animate-pulse"></div>
                <div class="h-3 w-10 rounded bg-white/10 animate-pulse"></div>
              </div>
              <div class="h-3 w-24 mt-1 rounded bg-white/10 animate-pulse"></div>
            </td>
            <td class="px-4 py-3">
              <div class="h-4 w-16 rounded bg-white/10 animate-pulse"></div>
            </td>
            <td class="px-4 py-3">
              <div class="h-4 w-12 rounded bg-white/10 animate-pulse"></div>
            </td>
            <td class="px-4 py-3">
              <div class="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
            </td>
            <td class="px-4 py-3">
              <div class="h-9 w-40 rounded bg-white/5 animate-pulse"></div>
            </td>
          </tr>

          <tr v-if="!isPageLoading && !sorted.length && !pool.length">
            <td colspan="6" class="px-4 py-6 text-center text-white/60">Aucune paire trouvée</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="px-4 py-3 border-t border-white/5">
      <MarketPagination
        :page="page"
        :total="pool.length"
        :per-page="perPage"
        @update:page="page = $event"
        @update:perPage="perPage = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch, computed } from 'vue'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import { useKlines } from '~/composables/useKlines'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { Ticker24h } from '~/types/binance'

type Row = {
  symbol: string
  price: number
  ch24: number
  vol24: number
  spark: number[]
}

const props = withDefaults(
  defineProps<{ symbols?: string[]; pageSize?: number; autoRefreshMs?: number }>(),
  { symbols: undefined, pageSize: 50, autoRefreshMs: 0 },
)

const { universe, maps } = useSymbolsUniverse()
const pool = computed<string[]>(() => (props.symbols?.length ? props.symbols : universe.value))

const sortKey = ref<keyof Row>('vol24')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const perPage = ref(props.pageSize)

const loading = ref(false)
const cache = reactive(new Map<string, Row>())

const start = computed(() => (page.value - 1) * perPage.value)
const end = computed(() => start.value + perPage.value)
const viewSymbols = computed(() => pool.value.slice(start.value, end.value))

const rows = computed(() => {
  const arr = viewSymbols.value.map((s) => cache.get(s)).filter(Boolean) as Row[]
  const missing = viewSymbols.value.filter((s) => !cache.has(s))
  if (missing.length) loadPage()
  return arr
})

const { ticker24h } = useBinanceMarket()

async function makeRow(sym: string): Promise<Row> {
  const t = await ticker24h(sym)
  const v = t.data.value
  const r = (Array.isArray(v) ? v.find((x) => (x as Ticker24h).symbol === sym) : v) as
    | Ticker24h
    | undefined

  const { candles, refresh } = useKlines(sym, '1h', 24 * 7)
  await refresh()

  return {
    symbol: sym,
    price: Number(r?.lastPrice ?? 0),
    ch24: Number(r?.priceChangePercent ?? 0),
    vol24: Number(r?.quoteVolume ?? 0),
    spark: candles.value.map((c) => c.close),
  }
}

async function loadPage() {
  if (loading.value) return
  loading.value = true
  try {
    const syms = viewSymbols.value.filter((s) => !cache.has(s))
    const res = await Promise.allSettled(syms.map(makeRow))
    res.forEach((p, i) => {
      if (p.status === 'fulfilled') cache.set(syms[i], p.value)
    })
  } finally {
    loading.value = false
  }
}

let liveId: number | null = null
onMounted(() => {
  if ((props.autoRefreshMs ?? 0) > 0) {
    liveId = globalThis.setInterval(() => loadPage(), props.autoRefreshMs!)
  }
})
onBeforeUnmount(() => {
  if (liveId !== null) globalThis.clearInterval(liveId)
})
watch(
  () => props.autoRefreshMs,
  (ms) => {
    if (liveId !== null) globalThis.clearInterval(liveId)
    liveId = null
    if ((ms ?? 0) > 0) liveId = globalThis.setInterval(() => loadPage(), ms!)
  },
)

watch(
  [pool, perPage],
  () => {
    page.value = 1
    cache.clear()
    loadPage()
  },
  { immediate: true },
)
watch(page, () => loadPage())

const sorted = computed(() => {
  const arr = [...rows.value]
  arr.sort((a, b) => {
    const va = a[sortKey.value],
      vb = b[sortKey.value]
    return (sortDir.value === 'asc' ? 1 : -1) * (va > vb ? 1 : va < vb ? -1 : 0)
  })
  return arr
})

function setSort(k: keyof Row) {
  if (sortKey.value === k) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = k
    sortDir.value = 'desc'
  }
}

const isUniverseLoading = computed(() => !props.symbols?.length && universe.value.length === 0)
const isPageLoading = computed(() => viewSymbols.value.some((s) => !cache.has(s)))
const missingCount = computed(() => Math.max(0, viewSymbols.value.length - rows.value.length))

defineExpose({ maps, setSort })
</script>
