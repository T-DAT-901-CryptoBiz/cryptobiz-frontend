import { computed } from 'vue'

type Listing = {
  data?: {
    children?: Array<{ data?: Child }>
  }
}
type Child = {
  id?: string
  title?: string
  url?: string
  permalink?: string
  author?: string
  subreddit?: string
  created_utc?: number
  score?: number
  num_comments?: number
  over_18?: boolean
  thumbnail?: string
  selftext?: string
}

export interface RedditPost {
  id: string
  title: string
  url: string
  permalink: string
  author: string
  subreddit: string
  created_utc: number
  score: number
  num_comments: number
  thumbnail?: string | null
  selftext?: string | null
}

function norm(c?: Child): RedditPost | null {
  if (!c?.id || !c.title || !c.subreddit || !c.author || c.over_18) return null
  return {
    id: c.id,
    title: c.title,
    url: c.url || `https://www.reddit.com${c.permalink || '/'}`,
    permalink: `https://www.reddit.com${c.permalink || '/'}`,
    author: c.author,
    subreddit: c.subreddit,
    created_utc: c.created_utc || 0,
    score: c.score || 0,
    num_comments: c.num_comments || 0,
    thumbnail: c.thumbnail && c.thumbnail.startsWith('http') ? c.thumbnail : null,
    selftext: c.selftext || null,
  }
}

async function getListing(url: string): Promise<RedditPost[]> {
  if (import.meta.server) return []
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return []
  const j = (await res.json()) as Listing
  const children = j.data?.children || []
  const posts = children.map((ch) => norm(ch.data)).filter((p): p is RedditPost => !!p)
  return posts
}

export type Sort = 'hot' | 'new' | 'top' | 'rising'
export type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'

export interface UseRedditOpts {
  subreddits?: string[]
  query?: string
  sort?: Sort
  t?: TimeRange
  limit?: number
}

export function useRedditPublic(opts: UseRedditOpts) {
  const sort = opts.sort || 'hot'
  const t = opts.t || 'day'
  const limit = Math.max(1, Math.min(opts.limit ?? 20, 100))

  const urls = computed(() => {
    const u: string[] = []
    if (opts.subreddits?.length) {
      for (const sr of opts.subreddits) {
        const base = `https://www.reddit.com/r/${encodeURIComponent(sr)}/${sort}.json?limit=${limit}`
        u.push(sort === 'top' ? `${base}&t=${t}` : base)
      }
    }
    if (opts.query) {
      const q = `https://www.reddit.com/search.json?q=${encodeURIComponent(
        opts.query,
      )}&limit=${limit}&sort=${sort}&type=link`
      u.push(q)
    }
    return u
  })

  const key = computed(
    () => `reddit:${(opts.subreddits || []).join(',')}:${opts.query || ''}:${sort}:${t}:${limit}`,
  )

  const promise = async () => {
    const lists = await Promise.all(urls.value.map((u) => getListing(u)))
    const map = new Map<string, RedditPost>()
    for (const arr of lists) for (const p of arr) map.set(p.id, p)
    const merged = [...map.values()]
    if (sort === 'top') merged.sort((a, b) => b.score - a.score)
    else merged.sort((a, b) => b.created_utc - a.created_utc)
    return merged
  }

  const { data, pending, error, refresh } = useAsyncData<RedditPost[]>(key, promise, {
    server: false,
    default: () => [],
  })

  return { posts: data, pending, error, refresh }
}
