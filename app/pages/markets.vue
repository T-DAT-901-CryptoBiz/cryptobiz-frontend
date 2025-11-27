<template>
  <div class="space-y-6">
    <ClientOnly>
      <MarketHighlights class="mb-2" />
      <MarketCategoryBar
        v-model="cat"
        v-model:tagValue="tag"
        @change="onFilterChange"
        @search="onSearch"
      />
    </ClientOnly>

    <MarketTablePro
      v-if="areBaseDataLoaded"
      ref="tableRef"
      :symbols="filtered"
      :page-size="20"
      market="auto"
      :futures-set="futUni"
      :all24h-data="rows"
    />
    <div v-else class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
      <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div class="text-sm text-white/70">All Crypto</div>
        <div class="text-xs text-white/50">
          <span class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-white/60">
            <tr class="[&>th]:px-4 [&>th]:py-3 text-left">
              <th>#</th>
              <th>Asset</th>
              <th>Price</th>
              <th>24h %</th>
              <th>24h Volume</th>
              <th>7d Chart</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in 20" :key="'sk-' + i" class="border-t border-white/5">
              <td class="px-4 py-3">
                <div class="h-4 w-8 rounded bg-white/10 animate-pulse"></div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="h-5 w-5 rounded-full bg-white/10 animate-pulse"></div>
                  <div class="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="h-4 w-20 rounded bg-white/10 animate-pulse"></div>
              </td>
              <td class="px-4 py-3">
                <div class="h-4 w-16 rounded bg-white/10 animate-pulse"></div>
              </td>
              <td class="px-4 py-3">
                <div class="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
              </td>
              <td class="px-4 py-3">
                <div class="h-9 w-40 rounded bg-white/10 animate-pulse"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import { useFuturesUniverse } from '~/composables/useFuturesUniverse'
import { useAll24h } from '~/composables/useAll24h'

const q = ref('')
const cat = ref<'favorites' | 'all'>('all')
const tag = ref<'all' | 'trending' | 'gainers' | 'losers' | 'volume' | string>('all')

function onSearch(v: string) {
  q.value = (v ?? '').trim()
}
function onFilterChange(p: { category: string; tag: string }) {
  cat.value = (p.category as 'favorites' | 'all') || 'all'
  tag.value = (p.tag as 'all' | 'trending' | 'gainers' | 'losers' | 'volume' | string) || 'all'
}

useHead({
  title: 'Markets - CryptoBiz',
})

const { universe: spotUni, loading: spotLoading } = useSymbolsUniverse() // Ex: ['BTCUSDT', ...]
const { symbols: futUni, pending: futPending } = useFuturesUniverse() // Ex: ['BTCUSDT', ...] (USDT-M futures)

const { rows, pending: all24hPending, refresh } = useAll24h() // rows: Ticker24h[]
onMounted(() => refresh())

const tableRef = ref<{
  areSparklinesLoaded?: { value: boolean }
  setSort?: (k: 'price' | 'ch24' | 'vol24' | 'volatility', dir?: 'asc' | 'desc') => void
} | null>(null)

// Calculer si les données de base sont chargées
const areBaseDataLoaded = computed(() => {
  return (
    !spotLoading.value &&
    !futPending.value &&
    !all24hPending.value &&
    rows.value.length > 0 &&
    filtered.value.length > 0
  )
})

/* ---------- utils ---------- */
const STABLES = ['USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD']

const NAME_MAP: Record<string, string> = {
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

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

function splitSymbol(sym: string) {
  const m = sym.match(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/)
  const quote = m?.[0] ?? ''
  const base = sym.slice(0, sym.length - quote.length)
  return { base, quote }
}

const { list: favoritesList } = useWatchlist()

const baseUniverse = computed<string[]>(() => {
  // Filtrer pour ne garder que les paires /USDT
  const allSymbols = Array.from(new Set([...spotUni.value, ...futUni.value])).filter((s) =>
    s.endsWith('USDT'),
  )

  if (cat.value === 'favorites') {
    const favSet = new Set(favoritesList.value)
    return allSymbols.filter((s) => favSet.has(s))
  }
  return allSymbols
})

const spotMetrics = computed(() => {
  const map = new Map<string, { pct: number; vol: number; trades: number }>()
  for (const t of rows.value) {
    const sym = t.symbol
    map.set(sym, {
      pct: Number(t.priceChangePercent ?? 0),
      vol: Number(t.quoteVolume ?? 0),
      trades: Number(t.count ?? 0), // "count" ~ nb de trades 24h
    })
  }
  return map
})

function topSetBy(key: 'pct' | 'vol' | 'trades', dir: 'asc' | 'desc', limit = 300): Set<string> {
  const arr: Array<{ sym: string; v: number }> = []
  for (const [sym, m] of spotMetrics.value) {
    const { quote } = splitSymbol(sym)
    // Ne garder que les paires USDT pour correspondre au filtre du tableau
    if (quote !== 'USDT') continue
    const v = m[key]
    arr.push({ sym, v: Number.isFinite(v) ? v : 0 })
  }
  arr.sort((a, b) => (dir === 'asc' ? a.v - b.v : b.v - a.v))
  return new Set(arr.slice(0, limit).map((x) => x.sym))
}

const trendingSpot = computed(() => topSetBy('trades', 'desc', 300))
const gainersSpot = computed(() => topSetBy('pct', 'desc', 300))
const losersSpot = computed(() => topSetBy('pct', 'asc', 300))
const volumeSpot = computed(() => topSetBy('vol', 'desc', 300))

const trendingBases = computed(
  () => new Set([...trendingSpot.value].map((s) => splitSymbol(s).base)),
)
const gainersBases = computed(() => new Set([...gainersSpot.value].map((s) => splitSymbol(s).base)))
const losersBases = computed(() => new Set([...losersSpot.value].map((s) => splitSymbol(s).base)))
const volumeBases = computed(() => new Set([...volumeSpot.value].map((s) => splitSymbol(s).base)))

function passTag(sym: string): boolean {
  const t = tag.value
  if (t === 'all') return true
  if (!rows.value.length) return true

  const { base, quote } = splitSymbol(sym)
  const isSpotLike = STABLES.includes(quote)

  switch (t) {
    case 'trending':
      return isSpotLike ? trendingSpot.value.has(sym) : trendingBases.value.has(base)
    case 'gainers':
      return isSpotLike ? gainersSpot.value.has(sym) : gainersBases.value.has(base)
    case 'losers':
      return isSpotLike ? losersSpot.value.has(sym) : losersBases.value.has(base)
    case 'volume':
      return isSpotLike ? volumeSpot.value.has(sym) : volumeBases.value.has(base)
    default:
      return true
  }
}

function matchesSearch(sym: string, query: string): boolean {
  if (!query) return true
  const qn = norm(query)
  const { base } = splitSymbol(sym)
  const full = NAME_MAP[base] || ''
  return norm(sym).includes(qn) || norm(base).includes(qn) || norm(full).includes(qn)
}

const filtered = computed<string[]>(() =>
  baseUniverse.value.filter((sym) => passTag(sym) && matchesSearch(sym, q.value)),
)

// Tri automatique selon le tag sélectionné (une seule fois lors du changement de tag)
const lastTag = ref<string>(tag.value)
watch(
  tag,
  (newTag) => {
    // Ne déclencher le tri que si le tag a vraiment changé
    if (newTag === lastTag.value || !tableRef.value?.setSort) return
    lastTag.value = newTag

    switch (newTag) {
      case 'gainers':
        // Tri par pourcentage de changement décroissant (les plus gros gains en premier)
        tableRef.value.setSort('ch24', 'desc')
        break
      case 'losers':
        // Tri par pourcentage de changement croissant (les plus grosses pertes en premier)
        tableRef.value.setSort('ch24', 'asc')
        break
      case 'volume':
        // Tri par volume décroissant
        tableRef.value.setSort('vol24', 'desc')
        break
      case 'volatility':
        // Tri par volatilité (valeur absolue du pourcentage) décroissant
        tableRef.value.setSort('volatility', 'desc')
        break
      default:
        // Par défaut, tri par volume
        tableRef.value.setSort('vol24', 'desc')
        break
    }
  },
  { flush: 'post' },
)
</script>
