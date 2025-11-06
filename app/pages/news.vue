<template>
  <div class="space-y-6">
    <ClientOnly>
      <NewsHighlights />
      <MarketCategoryBar
        v-model="categoryUI"
        v-model:tagValue="tagUI"
        :categories="newsCats"
        :tags="newsTags"
        @change="onFilterChange"
        @search="onSearch"
      />
    </ClientOnly>

    <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
      <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div class="text-sm text-white/70">All News</div>
        <div class="text-xs text-white/50">
          <template v-if="pending">
            <span class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
          </template>
          <template v-else> Rows: {{ shownTotal.toLocaleString() }}</template>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm" :aria-busy="pending">
          <thead class="text-white/60">
            <tr class="[&>th]:px-4 [&>th]:py-3 text-left">
              <th>#</th>
              <th>Headline</th>
              <th class="hidden md:table-cell">Source</th>
              <th class="hidden sm:table-cell">Tickers</th>
              <th class="hidden md:table-cell">Published</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-if="pending || (categoryUI === 'favorites' && favoritesLoading)"
              v-for="i in perPage"
              :key="'sk-' + i"
              class="border-t border-white/5"
            >
              <td class="px-4 py-3"><div class="h-4 w-8 rounded bg-white/10 animate-pulse" /></td>
              <td class="px-4 py-3">
                <div class="h-4 w-56 rounded bg-white/10 animate-pulse" />
                <div class="mt-1 h-3 w-40 rounded bg-white/10 animate-pulse" />
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <div class="h-4 w-24 rounded bg-white/10 animate-pulse" />
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <div class="h-4 w-32 rounded bg-white/10 animate-pulse" />
              </td>
              <td class="px-4 py-3"><div class="h-4 w-16 rounded bg-white/10 animate-pulse" /></td>
              <td class="px-4 py-3 hidden md:table-cell">
                <div class="h-4 w-24 rounded bg-white/10 animate-pulse" />
              </td>
            </tr>

            <tr
              v-for="(n, i) in pageItems"
              :key="n.id"
              class="border-t border-white/5 hover:bg-white/5 cursor-pointer group"
              @click="open(n)"
            >
              <td class="px-4 py-3">{{ start + i + 1 }}</td>

              <td class="px-4 py-3">
                <div class="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    class="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 text-white/60 hover:bg-white/10 hover:text-white transition"
                    :aria-pressed="isFav(n.id)"
                    :title="isFav(n.id) ? 'Remove from favorites' : 'Add to favorites'"
                    @click.stop="toggleFav(n.id)"
                  >
                    <Icon
                      :name="isFav(n.id) ? 'lucide:star' : 'lucide:star'"
                      class="h-4 w-4"
                      :class="isFav(n.id) ? 'text-yellow-300' : ''"
                    />
                  </button>

                  <div class="min-w-0">
                    <div
                      class="font-medium truncate group-hover:underline"
                      :class="isRead(n.id) ? 'text-white/70' : 'text-white'"
                    >
                      {{ n.title }}
                      <span v-if="!isRead(n.id)">
                        <Icon name="lucide:eye" class="h-4 w-4 text-rose-400" />
                      </span>
                    </div>
                    <div class="text-xs text-white/60 line-clamp-2">
                      {{ truncateText(n.description || '', 20) }}
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-4 py-3 hidden md:table-cell">
                <div class="inline-flex items-center gap-2">
                  <img
                    :src="favicon(n.link)"
                    alt=""
                    class="h-4 w-4 rounded-sm ring-1 ring-white/10 object-cover"
                    loading="lazy"
                  />
                  <span class="text-white/80">{{ n.rss_source || n.category || '—' }}</span>
                </div>
              </td>

              <td class="px-4 py-3 hidden sm:table-cell">
                <div class="flex flex-wrap gap-1.5">
                  <template v-if="normTickersFromNews(n).length">
                    <span
                      v-for="t in normTickersFromNews(n).slice(0, 5)"
                      :key="t"
                      class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/5 ring-1 ring-white/10 text-[11px] text-white/80"
                    >
                      <ui-coin-logo :asset="t" :size="14" />
                      <span class="font-medium">{{ t }}</span>
                    </span>
                  </template>
                  <span v-else class="text-white/50">—</span>
                </div>
              </td>

              <td class="px-4 py-3 hidden md:table-cell whitespace-nowrap text-white/80">
                {{ formatDate(n.publish_date) }}
              </td>
            </tr>

            <tr v-if="!pending && !pageItems.length">
              <td colspan="6" class="px-4 py-6 text-center text-white/60">No articles</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="px-4 py-3 border-t border-white/5">
        <MarketPagination
          :page="page"
          :total="shownTotal"
          :per-page="perPage"
          @update:page="page = $event"
          @update:perPage="perPage = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import {
  useArticlesList,
  useNewsLocalState,
  type ListQuery,
  type Article,
} from '~/composables/useArticles'
import NewsHighlights from '~/components/news/NewsHighlights.vue'

const q = ref('')
const categoryUI = ref<'favorites' | 'all'>('all')
const tagUI = ref<'all' | 'trending' | 'breaking' | 'unread'>('all')

function onSearch(v: string) {
  q.value = (v ?? '').trim()
}
function onFilterChange(p: { category: string; tag: string }) {
  categoryUI.value = (p.category as 'favorites' | 'all') || 'all'
  tagUI.value = (p.tag as 'all' | 'trending' | 'breaking' | 'unread') || 'all'
}

const newsCats = [
  { label: 'Favorites', value: 'favorites' },
  { label: 'All', value: 'all' },
]
const newsTags = [
  { label: 'All', value: 'all', cat: 'all' },
  { label: 'Trending', value: 'trending', cat: 'all' },
  { label: 'Breaking (24h)', value: 'breaking', cat: 'all' },
]

const page = ref(1)
const perPage = ref(20)

const date24hFrom = computed(() => {
  if (tagUI.value !== 'breaking') return null
  const d = new Date(Date.now() - 24 * 3600 * 1000)
  return d.toISOString().slice(0, 10)
})

const listParams = computed<ListQuery>(() => ({
  page: page.value,
  per_page: perPage.value,
  search: q.value || null,
  category: categoryUI.value === 'all' ? null : undefined,
  date_from: date24hFrom.value,
  sort_by: tagUI.value === 'trending' ? 'create_time' : 'publish_date',
  sort_order: 'desc',
}))

const { items, total, pending } = useArticlesList(listParams)
const { isFav, toggleFav, isRead, markRead, fav, refreshFavorites } = useNewsLocalState()

// Charger tous les favoris au montage
onMounted(() => {
  void refreshFavorites()
})

// Quand on filtre par favoris, charger tous les articles favoris sans pagination
const favoriteIds = computed(() => Array.from(fav.value))
const favoriteItems = ref<Article[]>([])
const favoritesLoading = ref(false)

// Charger tous les articles favoris quand on active le filtre favoris
watch(
  () => [categoryUI.value, favoriteIds.value],
  async ([cat, ids]) => {
    if (cat === 'favorites' && ids.length > 0 && !favoritesLoading.value) {
      favoritesLoading.value = true
      try {
        // Charger tous les articles favoris sans pagination
        const allFavorites: Article[] = []

        // Charger par lots pour éviter de surcharger l'API
        const batchSize = 20
        for (let i = 0; i < ids.length; i += batchSize) {
          const batch = ids.slice(i, i + batchSize)
          // Charger chaque article individuellement
          const results = await Promise.allSettled(
            batch.map((id) =>
              $fetch<Article>(`http://127.0.0.1:8004/api/v1/articles/${id}`).catch(() => null),
            ),
          )
          results.forEach((result) => {
            if (result.status === 'fulfilled' && result.value) {
              allFavorites.push(result.value)
            }
          })

          // Petit délai entre les lots pour ne pas surcharger
          if (i + batchSize < ids.length) {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        }

        // Trier par date de publication (plus récent en premier)
        allFavorites.sort((a, b) => {
          const dateA = new Date(a.publish_date).getTime()
          const dateB = new Date(b.publish_date).getTime()
          return dateB - dateA
        })

        favoriteItems.value = allFavorites
      } catch (error) {
        console.error('Failed to load favorite articles:', error)
        favoriteItems.value = []
      } finally {
        favoritesLoading.value = false
      }
    } else if (cat !== 'favorites') {
      favoriteItems.value = []
    }
  },
  { immediate: true },
)

// Rafraîchir la liste des favoris quand on en ajoute/supprime
watch(favoriteIds, async (newIds, oldIds) => {
  if (categoryUI.value === 'favorites') {
    if (newIds.length === 0) {
      favoriteItems.value = []
      return
    }

    // Si on ajoute un favori, ajouter l'article à la liste
    if (oldIds && newIds.length > oldIds.length) {
      const addedId = newIds.find((id) => !oldIds.includes(id))
      if (addedId && !favoriteItems.value.find((a) => a.id === addedId)) {
        try {
          const article = await $fetch<Article>(`http://127.0.0.1:8004/api/v1/articles/${addedId}`)
          if (article) {
            favoriteItems.value.push(article)
            // Re-trier
            favoriteItems.value.sort((a, b) => {
              const dateA = new Date(a.publish_date).getTime()
              const dateB = new Date(b.publish_date).getTime()
              return dateB - dateA
            })
          }
        } catch {
          // Ignore errors, on rechargera tout
        }
      }
    } else if (oldIds && newIds.length < oldIds.length) {
      // Si on supprime un favori, le retirer de la liste
      const removedId = oldIds.find((id) => !newIds.includes(id))
      if (removedId) {
        favoriteItems.value = favoriteItems.value.filter((a) => a.id !== removedId)
      }
    }
  }
})

const filteredClient = computed<Article[]>(() => {
  let out: Article[]

  if (categoryUI.value === 'favorites') {
    // Utiliser la liste complète des favoris chargée
    out = favoriteItems.value
  } else {
    // Utiliser les items de la liste paginée normale
    out = items.value
  }

  // Appliquer le filtre "unread" si nécessaire
  if (tagUI.value === 'unread') {
    out = out.filter((a) => !isRead(a.id))
  }

  return out
})

// Pour les favoris, on pagine côté client
const start = computed(() => {
  if (categoryUI.value === 'favorites') {
    return (page.value - 1) * perPage.value
  }
  return (page.value - 1) * perPage.value
})

const pageItems = computed(() => {
  if (categoryUI.value === 'favorites') {
    // Pagination côté client pour les favoris
    return filteredClient.value.slice(start.value, start.value + perPage.value)
  }
  return filteredClient.value
})

const shownTotal = computed(() => {
  if (categoryUI.value === 'favorites') {
    return filteredClient.value.length
  }
  if (tagUI.value === 'unread') {
    return filteredClient.value.length
  }
  return total.value
})

watch([q, tagUI, categoryUI, perPage], () => {
  page.value = 1
})

function open(n: Article) {
  markRead(n.id)
  if (import.meta.client) {
    window.open(n.link, '_blank', 'noopener,noreferrer')
  }
}
function formatDate(iso: string) {
  const d = new Date(iso)
  const y = d.getFullYear()
  const M = String(d.getMonth() + 1).padStart(2, '0')
  const D = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${M}-${D} ${h}:${m}`
}
function favicon(u: string) {
  if (!import.meta.client) {
    return `https://icons.duckduckgo.com/ip3/example.com.ico`
  }
  try {
    const host = new URL(u).hostname
    return `https://icons.duckduckgo.com/ip3/${host}.ico`
  } catch {
    // Ignore URL parsing errors
    return `https://icons.duckduckgo.com/ip3/example.com.ico`
  }
}
function truncateText(text: string, wordLimit: number): string {
  const words = (text || '').trim().split(/\s+/)
  if (words.length <= wordLimit) return text
  return words.slice(0, wordLimit).join(' ') + '…'
}

const NAME2SYM: Record<string, string> = {
  bitcoin: 'BTC',
  btc: 'BTC',
  ether: 'ETH',
  ethereum: 'ETH',
  eth: 'ETH',
  binance: 'BNB',
  'binance coin': 'BNB',
  bnb: 'BNB',
  ripple: 'XRP',
  xrp: 'XRP',
  cardano: 'ADA',
  ada: 'ADA',
  dogecoin: 'DOGE',
  doge: 'DOGE',
  solana: 'SOL',
  sol: 'SOL',
  tron: 'TRX',
  trx: 'TRX',
  polkadot: 'DOT',
  dot: 'DOT',
  chainlink: 'LINK',
  link: 'LINK',
  litecoin: 'LTC',
  ltc: 'LTC',
  'bitcoin cash': 'BCH',
  bch: 'BCH',
  cosmos: 'ATOM',
  atom: 'ATOM',
  stellar: 'XLM',
  xlm: 'XLM',
  'ethereum classic': 'ETC',
  etc: 'ETC',
  near: 'NEAR',
  aptos: 'APT',
  apt: 'APT',
  sui: 'SUI',
  arbitrum: 'ARB',
  arb: 'ARB',
  optimism: 'OP',
  render: 'RNDR',
  rndr: 'RNDR',
  aave: 'AAVE',
  uniswap: 'UNI',
  maker: 'MKR',
  compound: 'COMP',
  'the sandbox': 'SAND',
  sand: 'SAND',
  decentraland: 'MANA',
  mana: 'MANA',
  'axie infinity': 'AXS',
  axs: 'AXS',
  apecoin: 'APE',
  ape: 'APE',
  gala: 'GALA',
  enj: 'ENJ',
  enjin: 'ENJ',
  ton: 'TON',
  filecoin: 'FIL',
  fil: 'FIL',
  'internet computer': 'ICP',
  icp: 'ICP',
  fantom: 'FTM',
  ftm: 'FTM',
  hedera: 'HBAR',
  hbar: 'HBAR',
  vechain: 'VET',
  vet: 'VET',
  thorchain: 'RUNE',
  rune: 'RUNE',
  tether: 'USDT',
  'usd coin': 'USDC',
  usdc: 'USDC',
  fdusd: 'FDUSD',
  tusd: 'TUSD',
  busd: 'BUSD',
}
const COMMON_SYMS = new Set(Object.values(NAME2SYM))

function normStr(s?: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

// string|array → array
function coerceArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String)
  if (typeof v === 'string') {
    const s = v.trim()
    if (!s) return []
    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        return (JSON.parse(s) as string[]).map(String)
      } catch {
        // Ignore parsing errors
      }
    }
    return s.split(/[,\s|]+/).filter(Boolean)
  }
  return []
}

function toSymbol(raw: string): string | null {
  if (!raw) return null
  const clean = raw.replace(/[$#]/g, '').trim()
  const k = normStr(clean)
  if (NAME2SYM[k]) return NAME2SYM[k]
  const m = clean.match(/^[A-Za-z0-9]{2,10}$/)?.[0]
  if (!m) return null
  const up = m.toUpperCase()
  if (NAME2SYM[up.toLowerCase()]) return NAME2SYM[up.toLowerCase()]
  if (COMMON_SYMS.has(up)) return up
  return null
}

function normTickersFromNews(n: Article): string[] {
  const bag = new Set<string>()

  coerceArray((n as Record<string, unknown>)?.tickers).forEach((t) => {
    const s = toSymbol(String(t))
    if (s) bag.add(s)
  })
  coerceArray(
    (n as Record<string, unknown>)?.categories || (n as Record<string, unknown>)?.category,
  ).forEach((t) => {
    const s = toSymbol(String(t))
    if (s) bag.add(s)
  })

  const text = [n?.title, n?.description].filter(Boolean).join(' ')
  if (text) {
    const words = text.match(/[$#]?[A-Za-z][A-Za-z0-9]{1,9}/g) || []
    words.forEach((w) => {
      const s = toSymbol(w)
      if (s) bag.add(s)
    })
  }

  return [...bag]
}
</script>
