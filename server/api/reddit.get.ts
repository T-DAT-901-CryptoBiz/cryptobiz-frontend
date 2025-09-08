import { defineEventHandler, getQuery, setResponseHeader } from 'h3'

type Listing = { data?: { children?: Array<{ data?: any }> } }

function norm(d: any) {
  if (!d?.id || !d.title || !d.subreddit || !d.author || d.over_18) return null
  return {
    id: d.id,
    title: d.title,
    url: d.url || `https://www.reddit.com${d.permalink || '/'}`,
    permalink: `https://www.reddit.com${d.permalink || '/'}`,
    author: d.author,
    subreddit: d.subreddit,
    created_utc: d.created_utc || 0,
    score: d.score || 0,
    num_comments: d.num_comments || 0,
    thumbnail: d.thumbnail && d.thumbnail.startsWith('http') ? d.thumbnail : null,
    selftext: d.selftext || null,
  }
}

async function fetchListing(url: string) {
  try {
    const json = await $fetch<Listing>(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'cryptobiz-frontend/1.0 (+contact@example.com)',
      },
    })
    const children = json?.data?.children || []
    return children.map((c) => norm(c.data)).filter(Boolean) as any[]
  } catch {
    return []
  }
}

export default defineEventHandler(async (event) => {
  const q = getQuery(event) as {
    subs?: string
    q?: string
    sort?: 'hot' | 'new' | 'top' | 'rising'
    t?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
    limit?: string
  }

  const sort = (q.sort || 'hot') as 'hot' | 'new' | 'top' | 'rising'
  const t = (q.t || 'day') as 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
  const limit = Math.max(1, Math.min(Number(q.limit ?? 20) || 20, 100))

  const subs = (q.subs || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const urls: string[] = []
  for (const sr of subs) {
    const base = `https://www.reddit.com/r/${encodeURIComponent(sr)}/${sort}.json?limit=${limit}&raw_json=1`
    urls.push(sort === 'top' ? `${base}&t=${t}` : base)
  }
  if (q.q) {
    urls.push(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(
        q.q,
      )}&limit=${limit}&sort=${sort}&type=link&raw_json=1`,
    )
  }

  const lists = await Promise.all(urls.map((u) => fetchListing(u)))
  const map = new Map<string, any>()
  for (const arr of lists) for (const p of arr) map.set(p.id, p)

  const merged = [...map.values()]
  if (sort === 'top') merged.sort((a, b) => b.score - a.score)
  else merged.sort((a, b) => b.created_utc - a.created_utc)

  setResponseHeader(event, 'Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60')
  return merged
})
