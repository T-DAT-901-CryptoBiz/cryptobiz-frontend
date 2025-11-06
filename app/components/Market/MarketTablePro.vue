<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <div class="text-sm text-white/70">All Crypto</div>

      <div class="text-xs text-white/50">
        <template v-if="isUniverseLoading">
          <span class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
        </template>
        <template v-else> Rows: {{ sortedPool.length.toLocaleString() }}</template>
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
                v-if="r.spark && r.spark.length > 0"
                :points="r.spark"
                :positive="(r.spark.at(-1) ?? 0) >= (r.spark[0] ?? 0)"
                :width="160"
                :height="36"
              />
              <div v-else class="h-9 w-40 rounded bg-white/10 animate-pulse" />
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

          <tr v-if="!isPageLoading && !sorted.length && !sortedPool.length">
            <td colspan="6" class="px-4 py-6 text-center text-white/60">Aucune paire trouvée</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="px-4 py-3 border-t border-white/5">
      <MarketPagination
        :page="page"
        :total="sortedPool.length"
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
    all24hData?: Array<{
      symbol: string
      lastPrice?: string
      priceChangePercent?: string
      quoteVolume?: string
    }>
  }>(),
  {
    symbols: undefined,
    pageSize: 50,
    autoRefreshMs: 0,
    market: 'spot',
    futuresSet: () => [],
    all24hData: undefined,
  },
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
const isVolatilitySort = ref(false) // Flag pour savoir si on trie par volatilité
const page = ref(1)
const perPage = ref(props.pageSize)

const loading = ref(false)
const cache = reactive(new Map<string, Row>())

// Initialiser et mettre à jour le cache avec les données de all24hData
watch(
  () => props.all24hData,
  (data) => {
    if (data && Array.isArray(data)) {
      for (const ticker of data) {
        if (ticker.symbol) {
          // Toujours mettre à jour les données de base depuis all24hData
          // pour garantir la cohérence avec MarketHighlights
          const existing = cache.get(ticker.symbol)
          cache.set(ticker.symbol, {
            symbol: ticker.symbol,
            price: Number(ticker.lastPrice ?? 0),
            ch24: Number(ticker.priceChangePercent ?? 0),
            vol24: Number(ticker.quoteVolume ?? 0),
            spark: existing?.spark ?? [], // Conserver les sparklines si elles existent
          })
        }
      }
    }
  },
  { immediate: true, deep: true },
)

// Trier le pool complet basé sur les données en cache
// Utiliser un watch au lieu d'un computed pour éviter les recalculs constants
const sortedPool = ref<string[]>([])

function updateSortedPool() {
  const poolSymbols = [...pool.value]

  // Trier les symboles basés sur les données en cache
  poolSymbols.sort((symA, symB) => {
    const rowA = cache.get(symA)
    const rowB = cache.get(symB)

    // Si une donnée manque, mettre à la fin
    if (!rowA && !rowB) return 0
    if (!rowA) return 1
    if (!rowB) return -1

    let va: number
    let vb: number

    // Pour la volatilité, utiliser la valeur absolue de ch24
    if (isVolatilitySort.value && sortKey.value === 'ch24') {
      va = Math.abs(rowA.ch24)
      vb = Math.abs(rowB.ch24)
    } else {
      const valA = rowA[sortKey.value]
      const valB = rowB[sortKey.value]
      va = typeof valA === 'number' ? valA : 0
      vb = typeof valB === 'number' ? valB : 0
    }

    return (sortDir.value === 'asc' ? 1 : -1) * (va > vb ? 1 : va < vb ? -1 : 0)
  })

  sortedPool.value = poolSymbols
}

// Recalculer le tri seulement quand pool, sortKey, sortDir ou isVolatilitySort changent
watch(
  [pool, sortKey, sortDir, isVolatilitySort],
  () => {
    updateSortedPool()
  },
  { immediate: true },
)

// Paginer après le tri
const start = computed(() => (page.value - 1) * perPage.value)
const end = computed(() => start.value + perPage.value)
const viewSymbols = computed(() => sortedPool.value.slice(start.value, end.value))

const rows = computed(() => {
  const arr: Row[] = []
  for (const sym of viewSymbols.value) {
    const cached = cache.get(sym)
    if (cached) {
      // Si les sparklines sont vides, charger les données complètes
      if (!cached.spark || cached.spark.length === 0) {
        void loadRowData(sym)
      }
      arr.push(cached)
    }
  }
  // Déclencher le chargement des données manquantes
  const missing = viewSymbols.value.filter((s) => !cache.has(s))
  if (missing.length) {
    void loadAllDataForSort()
  }
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
      spark = Array.isArray(k) ? k.map((c: unknown[]) => Number(Array.isArray(c) ? c[4] : 0)) : []
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

let liveId: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  if ((props.autoRefreshMs ?? 0) > 0) {
    liveId = globalThis.setInterval(() => {
      void loadAllDataForSort()
    }, props.autoRefreshMs!) as ReturnType<typeof setInterval>
  }
  // Charger les sparklines après le montage
  setTimeout(() => {
    void loadSparklinesForCurrentPage()
  }, 200)
})
onBeforeUnmount(() => {
  if (liveId !== null) globalThis.clearInterval(liveId)
})
watch(
  () => props.autoRefreshMs,
  (ms) => {
    if (liveId !== null) globalThis.clearInterval(liveId)
    liveId = null
    if ((ms ?? 0) > 0) {
      liveId = globalThis.setInterval(() => {
        void loadAllDataForSort()
      }, ms!) as ReturnType<typeof setInterval>
    }
  },
)

// Charger les données complètes d'une row (incluant sparklines)
async function loadRowData(sym: string) {
  if (import.meta.server) return
  try {
    const existing = cache.get(sym)
    const fullRow = await makeRow(sym)
    // Préserver les données de base de all24hData si elles existent
    // car elles sont plus à jour et cohérentes avec MarketHighlights
    if (existing && existing.price > 0 && existing.ch24 !== 0) {
      cache.set(sym, {
        ...fullRow,
        price: existing.price,
        ch24: existing.ch24,
        vol24: existing.vol24,
      })
    } else {
      cache.set(sym, fullRow)
    }
  } catch {
    // Ignore errors
  }
}

// Charger les sparklines pour la page courante
async function loadSparklinesForCurrentPage() {
  if (import.meta.server) return
  const symsToLoad = viewSymbols.value.filter((s) => {
    const cached = cache.get(s)
    return cached && (!cached.spark || cached.spark.length === 0)
  })

  if (symsToLoad.length > 0) {
    // Charger par lots pour éviter de surcharger
    const batchSize = 10
    for (let i = 0; i < symsToLoad.length; i += batchSize) {
      const batch = symsToLoad.slice(i, i + batchSize)
      await Promise.allSettled(batch.map(loadRowData))
    }
  }
}

// Charger les données nécessaires pour le tri et l'affichage
async function loadAllDataForSort() {
  if (loading.value) return
  loading.value = true
  try {
    // Priorité 1: Charger les données complètes de la page courante (avec sparklines)
    // Inclure les symboles qui n'ont pas de données OU qui n'ont pas de sparklines
    const currentPageSyms = viewSymbols.value.filter((s) => {
      const cached = cache.get(s)
      return !cached || !cached.spark || cached.spark.length === 0
    })

    if (currentPageSyms.length > 0) {
      // Charger d'abord la page courante en priorité
      const batchSize = 10
      for (let i = 0; i < currentPageSyms.length; i += batchSize) {
        const batch = currentPageSyms.slice(i, i + batchSize).filter(Boolean)
        const res = await Promise.allSettled(batch.map(makeRow))
        res.forEach((p, idx) => {
          if (p.status === 'fulfilled' && batch[idx]) {
            const sym = batch[idx]
            const existing = cache.get(sym)
            // Préserver les données de base de all24hData
            if (existing && existing.price > 0 && existing.ch24 !== 0) {
              cache.set(sym, {
                ...p.value,
                price: existing.price,
                ch24: existing.ch24,
                vol24: existing.vol24,
              })
            } else {
              cache.set(sym, p.value)
            }
          }
        })
      }
    }

    // Priorité 2: Pour améliorer le tri, charger aussi les données des premières pages
    // On prend les premiers 500 symboles du pool (avant tri) pour avoir des données à trier
    const previewLimit = Math.min(500, pool.value.length)
    const previewSyms = pool.value.slice(0, previewLimit).filter((s) => !cache.has(s))

    if (previewSyms.length > 0) {
      // Charger par lots pour éviter de surcharger l'API
      const batchSize = 50
      for (let i = 0; i < previewSyms.length; i += batchSize) {
        const batch = previewSyms.slice(i, i + batchSize).filter(Boolean)
        const res = await Promise.allSettled(batch.map(makeRow))
        res.forEach((p, idx) => {
          if (p.status === 'fulfilled' && batch[idx]) {
            const sym = batch[idx]
            const existing = cache.get(sym)
            // Préserver les données de base de all24hData
            if (existing && existing.price > 0 && existing.ch24 !== 0) {
              cache.set(sym, {
                ...p.value,
                price: existing.price,
                ch24: existing.ch24,
                vol24: existing.vol24,
              })
            } else {
              cache.set(sym, p.value)
            }
          }
        })
      }
    }
  } finally {
    loading.value = false
  }
}

watch(
  [pool, perPage, sortKey, sortDir],
  () => {
    page.value = 1
    void loadAllDataForSort()
    // Charger les sparklines après le chargement initial
    setTimeout(() => {
      void loadSparklinesForCurrentPage()
    }, 100)
  },
  { immediate: true },
)
watch(page, () => {
  void loadAllDataForSort()
  // Charger aussi les sparklines pour la nouvelle page
  setTimeout(() => {
    void loadSparklinesForCurrentPage()
  }, 100)
})

// Les données sont déjà triées via sortedPool, donc on retourne rows directement
const sorted = computed(() => rows.value)

function setSort(k: keyof Row | 'volatility', dir?: 'asc' | 'desc') {
  if (dir !== undefined) {
    // Si une direction est fournie, l'utiliser directement
    if (k === 'volatility') {
      sortKey.value = 'ch24'
      sortDir.value = dir
      isVolatilitySort.value = true
    } else {
      sortKey.value = k as keyof Row
      sortDir.value = dir
      isVolatilitySort.value = false
    }
  } else if (sortKey.value === k || (k === 'volatility' && isVolatilitySort.value)) {
    // Si on clique sur la même colonne, inverser la direction
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    // Nouvelle colonne, tri décroissant par défaut
    if (k === 'volatility') {
      sortKey.value = 'ch24'
      sortDir.value = 'desc'
      isVolatilitySort.value = true
    } else {
      sortKey.value = k as keyof Row
      sortDir.value = 'desc'
      isVolatilitySort.value = false
    }
  }
  // Retourner à la page 1 lors du changement de tri
  page.value = 1
}

const isUniverseLoading = computed(() => !props.symbols?.length && universe.value.length === 0)
const isPageLoading = computed(() => viewSymbols.value.some((s) => !cache.has(s)))
const missingCount = computed(() => Math.max(0, viewSymbols.value.length - rows.value.length))

// Vérifier si toutes les sparklines de la page courante sont chargées
const areSparklinesLoaded = computed(() => {
  return viewSymbols.value.every((sym) => {
    const cached = cache.get(sym)
    return cached && cached.spark && cached.spark.length > 0
  })
})

const { list: watchlist, toggle: toggleWatchlist } = useWatchlist()

function isFav(sym: string) {
  return watchlist.value.includes(sym)
}

async function toggleFav(sym: string) {
  await toggleWatchlist(sym)
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

defineExpose({ maps, setSort, areSparklinesLoaded })
</script>
