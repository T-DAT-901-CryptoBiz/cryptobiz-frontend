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
      :symbols="filtered"
      :page-size="20"
      market="auto"
      :futures-set="futUni"
      :all24h-data="rows"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import { useFuturesUniverse } from '~/composables/useFuturesUniverse'
import { useAll24h } from '~/composables/useAll24h'

const q = ref('')
const cat = ref<'favorites' | 'spot' | 'futures' | 'all'>('all')
const tag = ref<'all' | 'trending' | 'gainers' | 'losers' | 'volume' | string>('all')

function onSearch(v: string) {
  q.value = (v ?? '').trim()
}
function onFilterChange(p: { category: string; tag: string }) {
  cat.value = (p.category as 'favorites' | 'spot' | 'futures' | 'all') || 'all'
  tag.value = (p.tag as 'all' | 'trending' | 'gainers' | 'losers' | 'volume' | string) || 'all'
}

const { universe: spotUni } = useSymbolsUniverse() // Ex: ['BTCUSDT', ...]
const { symbols: futUni } = useFuturesUniverse() // Ex: ['BTCUSDT', ...] (USDT-M futures)

const { rows, refresh } = useAll24h() // rows: Ticker24h[]

let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  void refresh()
  // Rafraîchir toutes les 30 secondes pour rester synchronisé avec MarketHighlights
  if (import.meta.client) {
    refreshInterval = setInterval(() => {
      void refresh()
    }, 30000)
  }
})

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval)
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
  if (cat.value === 'spot') return spotUni.value
  if (cat.value === 'futures') return futUni.value
  if (cat.value === 'favorites') {
    const favSet = new Set(favoritesList.value)
    return Array.from(new Set([...spotUni.value, ...futUni.value])).filter((s) => favSet.has(s))
  }
  return Array.from(new Set([...spotUni.value, ...futUni.value]))
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
    if (!STABLES.includes(quote)) continue // spot stable quote uniquement
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
</script>
