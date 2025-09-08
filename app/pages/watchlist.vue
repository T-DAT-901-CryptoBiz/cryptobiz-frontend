<template>
  <div class="space-y-6">
    <header
      class="rounded-2xl border border-white/5 bg-neutral-900/60 px-4 py-3 flex items-center justify-between"
    >
      <div>
        <h1 class="text-lg font-semibold">Watchlist</h1>
        <p class="text-xs text-white/60">Your favorite assets, at a glance.</p>
      </div>

      <div class="flex items-center gap-2 text-xs">
        <span class="px-2 py-1 rounded-md bg-white/5 text-white/70">
          {{ filteredSymbols.length }} assets
        </span>
        <button
          type="button"
          class="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/80"
          @click="refresh()"
        >
          Refresh
        </button>
        <button
          v-if="symbols.length"
          type="button"
          class="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-rose-300/90"
          @click="clearAll()"
        >
          Empty everything
        </button>
      </div>
    </header>

    <div class="rounded-2xl border border-white/5 bg-neutral-900/60 p-4">
      <div class="flex flex-col md:flex-row md:items-center gap-3">
        <div class="inline-flex rounded-xl bg-white/5 p-0.5 ring-1 ring-white/10">
          <button
            v-for="f in filters"
            :key="f.value"
            class="px-3 py-1.5 text-xs rounded-lg transition-colors"
            :class="
              filter === f.value ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10'
            "
            @click="filter = f.value"
          >
            {{ f.label }}
          </button>
        </div>

        <div class="md:ml-auto relative h-9 group">
          <input
            v-model="q"
            type="search"
            placeholder="Search by symbol or name..."
            class="h-9 w-[260px] rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/50 outline-none focus:bg-white/10"
            aria-label="Search"
          />
          <Icon
            name="lucide:search"
            class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60"
          />
        </div>
      </div>
    </div>

    <ClientOnly>
      <div v-if="filteredSymbols.length">
        <MarketTablePro
          :symbols="filteredSymbols"
          :page-size="20"
          market="auto"
          :futures-set="futuresUni"
        />
      </div>

      <div
        v-else
        class="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center"
      >
        <div class="mx-auto h-12 w-12 grid place-items-center rounded-full bg-white/5 mb-3">
          <Icon name="lucide:star" class="h-5 w-5 text-white/70" />
        </div>
        <p class="text-white/80 font-medium">Your watchlist is empty</p>
        <p class="text-sm text-white/60 mt-1">
          Go to the page <NuxtLink to="/markets" class="underline">Marchés</NuxtLink> then add
          assets with the star ★.
        </p>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import { useFuturesUniverse } from '~/composables/useFuturesUniverse'

type Filter = 'all' | 'spot' | 'futures'
const filters = [
  { label: 'All', value: 'all' as Filter },
  { label: 'Spot', value: 'spot' as Filter },
  { label: 'Futures', value: 'futures' as Filter },
]

const q = ref('')
const filter = ref<Filter>('all')

const { universe: spotUni } = useSymbolsUniverse()
const { symbols: futuresUni } = useFuturesUniverse()
const spotSet = computed(() => new Set(spotUni.value))
const futSet = computed(() => new Set(futuresUni.value))

const symbols = ref<string[]>([])
function load() {
  if (import.meta.server) return
  try {
    symbols.value = JSON.parse(localStorage.getItem('favoritesSymbols') || '[]')
  } catch {
    symbols.value = []
  }
}
function refresh() {
  load()
}
function clearAll() {
  if (import.meta.server) return
  localStorage.setItem('favoritesSymbols', '[]')
  symbols.value = []
}
onMounted(load)

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
function splitSymbol(sym: string) {
  const m = sym.match(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/)
  const quote = m?.[0] ?? ''
  const base = sym.slice(0, sym.length - quote.length)
  return { base, quote }
}

const filteredSymbols = computed(() => {
  const query = q.value.trim().toLowerCase()
  const list = symbols.value

  return list.filter((sym) => {
    if (filter.value === 'spot' && !spotSet.value.has(sym)) return false
    if (filter.value === 'futures' && !futSet.value.has(sym)) return false

    if (!query) return true

    const { base } = splitSymbol(sym)
    const full = (FULL_NAMES[base] || '').toLowerCase()
    const bySymbol = sym.toLowerCase().includes(query) || base.toLowerCase().includes(query)
    const byName = full.includes(query)
    return bySymbol || byName
  })
})
</script>
