import { computed, toValue } from 'vue'

export type Article = {
  id: number
  title: string
  link: string
  description?: string | null
  category?: string | null
  rss_source?: string | null
  publish_date: string
  create_time?: string
  image_url?: string | null
  tickers?: string[] | null
  score?: number | null
}

export type ArticleList = {
  articles: Article[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export type ArticleStats = {
  total_articles: number
  categories: Record<string, number>
  sources: Record<string, number>
  articles_by_date: Record<string, number>
  latest_article?: {
    id: number
    title: string
    link: string
    description?: string | null
    publish_date: string
    category?: string | null
    rss_source?: string | null
    create_time?: string
  } | null
}

export type ListQuery = {
  page?: number
  per_page?: number
  search?: string | null
  category?: string | null
  rss_source?: string | null
  date_from?: string | null
  date_to?: string | null
  sort_by?: 'publish_date' | 'title' | 'category' | 'create_time'
  sort_order?: 'asc' | 'desc'
}

const NAME2SYM: Record<string, string> = {
  bitcoin: 'BTC',
  btc: 'BTC',
  ethereum: 'ETH',
  ether: 'ETH',
  eth: 'ETH',
  binance: 'BNB',
  bnb: 'BNB',
  ripple: 'XRP',
  xrp: 'XRP',
  tron: 'TRX',
  trx: 'TRX',
  bitcoincash: 'BCH',
  'bitcoin cash': 'BCH',
  bch: 'BCH',
  solana: 'SOL',
  sol: 'SOL',
  cardano: 'ADA',
  ada: 'ADA',
  dogecoin: 'DOGE',
  doge: 'DOGE',
  polygon: 'MATIC',
  matic: 'MATIC',
  polkadot: 'DOT',
  dot: 'DOT',
  chainlink: 'LINK',
  link: 'LINK',
  litecoin: 'LTC',
  ltc: 'LTC',
  cosmos: 'ATOM',
  atom: 'ATOM',
  stellar: 'XLM',
  xlm: 'XLM',
  'ethereum classic': 'ETC',
  etc: 'ETC',
  arbitrum: 'ARB',
  arb: 'ARB',
  optimism: 'OP',
  op: 'OP',
  avalanche: 'AVAX',
  avax: 'AVAX',
  filecoin: 'FIL',
  fil: 'FIL',
  ton: 'TON',
  toncoin: 'TON',
  aptos: 'APT',
  apt: 'APT',
  sui: 'SUI',
  inj: 'INJ',
  rune: 'RUNE',
  vet: 'VET',
  hbar: 'HBAR',
  usdt: 'USDT',
  tether: 'USDT',
  usdc: 'USDC',
  fdusd: 'FDUSD',
  tusd: 'TUSD',
  busd: 'BUSD',
  usd: 'USD',
}

function norm(s?: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}
function toSym(raw: string): string | null {
  const k = norm(raw).replace(/[^\w\s]/g, '')
  if (!k) return null
  if (NAME2SYM[k]) return NAME2SYM[k]
  const up = raw.toUpperCase()
  if (/^[A-Z0-9]{2,10}$/.test(up)) return up
  return null
}

const buildQuery = (q: ListQuery) => {
  const out: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(q)) {
    if (v === null || v === undefined || v === '') continue
    if (typeof v === 'string' || typeof v === 'number') {
      out[k] = v
    }
  }
  return out
}

export function useArticlesList(params: MaybeRef<ListQuery>) {
  const p = computed(() => buildQuery(toValue(params) || {}))
  const key = computed(() => `articles:list:${JSON.stringify(p.value)}`)
  const { data, pending, refresh, error } = useAsyncData<ArticleList>(
    key,
    () =>
      $fetch('http://127.0.0.1:8004/api/v1/articles', {
        method: 'GET',
        query: p.value,
      }),
    { watch: [p] },
  )

  const items = computed(() => data.value?.articles ?? [])
  const total = computed(() => data.value?.total ?? 0)
  const page = computed(() => data.value?.page ?? toValue(params)?.page ?? 1)
  const perPage = computed(() => data.value?.per_page ?? toValue(params)?.per_page ?? 20)
  const totalPages = computed(() => data.value?.total_pages ?? 0)

  return { items, total, page, perPage, totalPages, pending, refresh, error }
}

export function useArticle(id: MaybeRef<number>) {
  const key = computed(() => `articles:item:${toValue(id)}`)
  return useAsyncData(key, () => $fetch(`/api/v1/articles/${toValue(id)}`), { watch: [id] })
}

export function useArticleCategories() {
  return useAsyncData('articles:categories', () =>
    $fetch<string[]>('http://127.0.0.1:8004/api/v1/articles/categories'),
  )
}

export function useArticleSources() {
  return useAsyncData('articles:sources', () =>
    $fetch<string[]>('http://127.0.0.1:8004/api/v1/articles/sources'),
  )
}

export function useArticleStats() {
  const { data, pending, refresh, error } = useAsyncData<ArticleStats>('news:stats', () =>
    $fetch('http://127.0.0.1:8004/api/v1/articles/stats'),
  )

  const total = computed(() => data.value?.total_articles ?? 0)

  const byDateArr = computed(() => {
    const m = data.value?.articles_by_date || {}
    return Object.entries(m)
      .map(([d, n]) => ({ date: d, count: Number(n) || 0 }))
      .sort((a, b) => a.date.localeCompare(b.date))
  })
  const lastNDays = (n: number) => {
    const today = new Date()
    const days: { date: string; count: number }[] = []
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const found = byDateArr.value.find((x) => x.date === key)
      days.push({ date: key, count: found?.count || 0 })
    }
    return days
  }
  const last14 = computed(() => lastNDays(14))
  const last24hCount = computed(() => {
    const key = new Date().toISOString().slice(0, 10)
    return byDateArr.value.find((x) => x.date === key)?.count ?? 0
  })

  const categoriesAgg = computed(() => {
    const src = data.value?.categories || {}
    const acc = new Map<string, number>()
    for (const [k, v] of Object.entries(src)) {
      const parts = String(k)
        .split(/[,|]/)
        .map((x) => x.trim())
        .filter(Boolean)
      const syms = parts.map((p) => toSym(p)).filter(Boolean) as string[]
      if (syms.length === 0) continue
      for (const s of syms) acc.set(s, (acc.get(s) || 0) + Number(v || 0))
    }
    return Array.from(acc.entries()).sort((a, b) => b[1] - a[1])
  })
  const topCategories = computed(() => categoriesAgg.value.slice(0, 10))

  const sourcesAgg = computed(() => {
    const src = data.value?.sources || {}
    return Object.entries(src)
      .map(([u, n]) => {
        let host = u
        try {
          host = new URL(u).hostname.replace(/^www\./, '')
        } catch {
          // Ignore URL parsing errors
        }
        return [host, Number(n) || 0] as [string, number]
      })
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  })

  const latest = computed(() => data.value?.latest_article || null)

  return {
    data,
    pending,
    error,
    refresh,
    total,
    last14,
    last24hCount,
    topCategories,
    sourcesAgg,
    latest,
  }
}

const READ_KEY = 'news:read:v1'

export function useNewsLocalState() {
  const { isAuthenticated } = useAuth()
  const fav = useState<Set<number>>('news:fav', () => new Set<number>())
  const read = useState<Set<number>>('news:read', () => new Set<number>())

  // Charger les favoris depuis l'API
  const refreshFavorites = async () => {
    if (!import.meta.client || !isAuthenticated.value) {
      fav.value = new Set<number>()
      return
    }

    try {
      const { favorites } = await $fetch<{ favorites: number[] }>('/api/favorites/news')
      fav.value = new Set<number>(favorites || [])
    } catch {
      fav.value = new Set<number>()
    }
  }

  // Charger les favoris au montage si authentifié
  if (import.meta.client && isAuthenticated.value && fav.value.size === 0) {
    void refreshFavorites()
  }

  // Recharger les favoris quand l'authentification change
  if (import.meta.client) {
    watch(isAuthenticated, (auth) => {
      if (auth) {
        void refreshFavorites()
      } else {
        fav.value = new Set<number>()
      }
    })
  }

  // Charger les articles lus depuis localStorage (état local)
  if (import.meta.client) {
    if (read.value.size === 0) {
      try {
        const stored = localStorage.getItem(READ_KEY) || '[]'
        read.value = new Set<number>(JSON.parse(stored))
      } catch {
        // Ignore parsing errors
      }
    }
  }

  const toggleFav = async (id: number) => {
    if (!import.meta.client || !isAuthenticated.value) return

    const wasFav = fav.value.has(id)

    if (wasFav) {
      fav.value.delete(id)
      try {
        await $fetch('/api/favorites/news', {
          method: 'DELETE',
          query: { id },
        })
      } catch {
        // Revert on error
        fav.value.add(id)
      }
    } else {
      fav.value.add(id)
      try {
        await $fetch('/api/favorites/news', {
          method: 'POST',
          body: { newsId: id },
        })
      } catch {
        // Revert on error
        fav.value.delete(id)
      }
    }
  }

  const markRead = (id: number) => {
    if (!read.value.has(id)) {
      read.value.add(id)
      if (import.meta.client) {
        localStorage.setItem(READ_KEY, JSON.stringify([...read.value]))
      }
    }
  }
  const clearRead = () => {
    read.value = new Set()
    if (import.meta.client) {
      localStorage.setItem(READ_KEY, JSON.stringify([]))
    }
  }

  const isFav = (id: number) => fav.value.has(id)
  const isRead = (id: number) => read.value.has(id)

  return { fav, read, isFav, isRead, toggleFav, markRead, clearRead, refreshFavorites }
}
