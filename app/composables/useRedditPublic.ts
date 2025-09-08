import { computed } from 'vue'

export type Sort = 'hot' | 'new' | 'top' | 'rising'
export type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
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
export interface UseRedditOpts {
  subreddits?: string[]
  query?: string
  sort?: Sort
  t?: TimeRange
  limit?: number
}

export function useRedditPublic(opts: UseRedditOpts) {
  const sort = opts.sort ?? 'hot'
  const t = opts.t ?? 'day'
  const limit = Math.max(1, Math.min(opts.limit ?? 20, 100))
  const subs = (opts.subreddits ?? []).join(',')

  const key = computed(() => `reddit:${subs}:${opts.query || ''}:${sort}:${t}:${limit}`)

  const { data, pending, error, refresh } = useAsyncData<RedditPost[]>(
    key,
    () =>
      $fetch('/api/reddit', {
        params: { subs, q: opts.query, sort, t, limit },
      }),
    { server: false, default: () => [] },
  )

  return { posts: data, pending, error, refresh }
}
