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
            class="border-t border-white/5 hover:bg-white/5 cursor-pointer group focus:outline-none"
            role="button"
            tabindex="0"
            @click="go(r.symbol)"
            @keydown.enter.prevent="go(r.symbol)"
            @keydown.space.prevent="go(r.symbol)"
          >
            <td class="px-4 py-3">{{ start + i + 1 }}</td>

            <!-- Asset cell: logo + Full name + (ticker) -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 min-w-0">
                <!-- Star -->
                <button
                  type="button"
                  class="group/star inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 text-white/50 hover:bg-white/10 hover:text-white transition"
                  :class="
                    isFav(r.symbol) ? 'text-yellow-300' : 'opacity-70 group-hover:opacity-100'
                  "
                  :aria-pressed="isFav(r.symbol)"
                  :title="isFav(r.symbol) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  @click.stop="toggleFav(r.symbol)"
                  @keydown.enter.stop.prevent="toggleFav(r.symbol)"
                  @keydown.space.stop.prevent="toggleFav(r.symbol)"
                >
                  <Icon name="lucide:star" class="h-4 w-4" />
                </button>

                <!-- Logo + nom -->
                <ui-coin-logo :asset="baseFromSymbol(r.symbol)" :size="20" />
                <div class="min-w-0">
                  <div class="font-medium truncate">
                    {{ baseFromSymbol(r.symbol) }}
                    <span class="text-xs text-white/60"
                      >— {{ fullName(baseFromSymbol(r.symbol)) }}</span
                    >
                  </div>
                  <span class="text-xs text-white/50">
                    /{{
                      maps.quote[r.symbol] || r.symbol.match(/USDT|FDUSD|USDC|BUSD|TUSD|USD$/)?.[0]
                    }}
                  </span>
                </div>
              </div>
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
                <div class="h-4 w-36 rounded bg-white/10 animate-pulse"></div>
              </div>
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
            <td class="px-4 py-3"><div class="h-9 w-40 rounded bg-white/5 animate-pulse"></div></td>
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
import { useRouter } from 'vue-router'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import { useKlines } from '~/composables/useKlines'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { Ticker24h } from '~/types/binance'

type Row = { symbol: string; price: number; ch24: number; vol24: number; spark: number[] }

const props = withDefaults(
  defineProps<{
    symbols?: string[]
    pageSize?: number
    autoRefreshMs?: number
    market?: 'spot' | 'futures' | 'auto'
    futuresSet?: string[]
  }>(),
  { symbols: undefined, pageSize: 50, autoRefreshMs: 0, market: 'spot', futuresSet: () => [] },
)

const router = useRouter()
function go(sym: string) {
  router.push(`/asset/${sym}`)
}

const { universe, maps } = useSymbolsUniverse() // fallback si props.symbols non fourni
const pool = computed<string[]>(() =>
  props.symbols !== undefined ? props.symbols : universe.value,
)
const sortKey = ref<keyof Row>('vol24')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const perPage = ref(props.pageSize)

const start = computed(() => (page.value - 1) * perPage.value)
const end = computed(() => start.value + perPage.value)
const viewSymbols = computed(() => pool.value.slice(start.value, end.value))

const loading = ref(false)
const cache = reactive(new Map<string, Row>())

const rows = computed(() => {
  const arr = viewSymbols.value.map((s) => cache.get(s)).filter(Boolean) as Row[]
  const missing = viewSymbols.value.filter((s) => !cache.has(s))
  if (missing.length) loadPage()
  return arr
})

const futSet = computed(() => new Set(props.futuresSet || []))
const { ticker24h } = useBinanceMarket()

async function makeRow(sym: string): Promise<Row> {
  if (import.meta.server) {
    return { symbol: sym, price: 0, ch24: 0, vol24: 0, spark: [] }
  }

  const shouldUseFutures =
    props.market === 'futures' || (props.market === 'auto' && futSet.value.has(sym))

  if (shouldUseFutures) {
    const t = await fetch(
      `https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${encodeURIComponent(sym)}`,
    ).then((r) => r.json())

    let spark: number[] = []
    try {
      const k = await fetch(
        `https://fapi.binance.com/fapi/v1/continuousKlines?pair=${encodeURIComponent(
          sym,
        )}&contractType=PERPETUAL&interval=1h&limit=168`,
      ).then((r) => r.json())
      spark = Array.isArray(k) ? k.map((c: any[]) => Number(c[4])) : []
    } catch {
      spark = []
    }

    return {
      symbol: sym,
      price: Number(t?.lastPrice ?? 0),
      ch24: Number(t?.priceChangePercent ?? 0),
      vol24: Number(t?.quoteVolume ?? 0),
      spark,
    }
  } else {
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
  loadFavorites()
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

const favorites = ref<Set<string>>(new Set())
function loadFavorites() {
  if (import.meta.server) return
  try {
    const raw = localStorage.getItem('favoritesSymbols') || '[]'
    favorites.value = new Set(JSON.parse(raw) as string[])
  } catch {
    favorites.value = new Set()
  }
}
function saveFavorites() {
  if (import.meta.server) return
  localStorage.setItem('favoritesSymbols', JSON.stringify([...favorites.value]))
}
function isFav(sym: string) {
  return favorites.value.has(sym)
}
function toggleFav(sym: string) {
  if (favorites.value.has(sym)) favorites.value.delete(sym)
  else favorites.value.add(sym)
  saveFavorites()
}

function baseFromSymbol(sym: string): string {
  const q = sym.match(/(USDT|FDUSD|USDC|BUSD|TUSD|USD|PERP)$/)?.[0] ?? ''
  return sym.slice(0, sym.length - q.length)
}

const FULL_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  BNB: 'BNB',
  SOL: 'Solana',
  XRP: 'XRP',
  ADA: 'Cardano',
  DOGE: 'Dogecoin',
  AVAX: 'Avalanche',
  MATIC: 'Polygon',
  TRX: 'TRON',
  DOT: 'Polkadot',
  LINK: 'Chainlink',
  LTC: 'Litecoin',
  BCH: 'Bitcoin Cash',
  ATOM: 'Cosmos',
  XLM: 'Stellar',
  ETC: 'Ethereum Classic',
  NEAR: 'NEAR',
  APT: 'Aptos',
  SUI: 'Sui',
  ARB: 'Arbitrum',
  OP: 'Optimism',
  INJ: 'Injective',
  RNDR: 'Render',
  AAVE: 'Aave',
  UNI: 'Uniswap',
  MKR: 'Maker',
  COMP: 'Compound',
  SAND: 'The Sandbox',
  MANA: 'Decentraland',
  AXS: 'Axie Infinity',
  APE: 'ApeCoin',
  GALA: 'Gala',
  ENJ: 'Enjin',
  TON: 'TON',
  FIL: 'Filecoin',
  ICP: 'Internet Computer',
  FTM: 'Fantom',
  HBAR: 'Hedera',
  VET: 'VeChain',
  RUNE: 'THORChain',
}
function fullName(base: string): string {
  return FULL_NAMES[base] || base
}

defineExpose({ maps, setSort })
</script>
