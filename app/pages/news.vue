<template>
  <div class="space-y-6">
    <ClientOnly>
      <MarketCategoryBar
        v-model="cat"
        v-model:tagValue="tag"
        :categories="newsCats"
        :tags="newsTags"
        @change="onFilterChange"
        @search="onSearch"
      />
    </ClientOnly>

    <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
      <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div class="text-sm text-white/70">
          {{ headerTitle }}
        </div>
        <div class="text-xs text-white/50">
          <template v-if="pending">
            <span class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
          </template>
          <template v-else> Rows: {{ total.toLocaleString() }}</template>
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
              <th class="cursor-pointer" @click="toggleSort('time')">Time</th>
              <th class="cursor-pointer hidden md:table-cell" @click="toggleSort('score')">
                Score
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-if="pending"
              v-for="i in perPage"
              :key="'sk-' + i"
              class="border-t border-white/5"
            >
              <td class="px-4 py-3">
                <div class="h-4 w-8 rounded bg-white/10 animate-pulse"></div>
              </td>
              <td class="px-4 py-3">
                <div class="h-4 w-56 rounded bg-white/10 animate-pulse"></div>
                <div class="mt-1 h-3 w-40 rounded bg-white/10 animate-pulse"></div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <div class="h-4 w-20 rounded bg-white/10 animate-pulse"></div>
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <div class="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
              </td>
              <td class="px-4 py-3">
                <div class="h-4 w-16 rounded bg-white/10 animate-pulse"></div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <div class="h-4 w-10 rounded bg-white/10 animate-pulse"></div>
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
                    class="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 text-white/50 hover:bg-white/10 hover:text-white transition"
                    :aria-pressed="isFav(n.id)"
                    :title="isFav(n.id) ? 'Remove from favorites' : 'Add to favorites'"
                    @click.stop="toggleFav(n.id)"
                  >
                    <Icon
                      :name="'lucide:star'"
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
                    </div>
                    <div class="text-xs text-white/60 truncate">{{ n.summary }}</div>
                  </div>
                </div>
              </td>

              <td class="px-4 py-3 hidden md:table-cell">
                <div class="inline-flex items-center gap-2">
                  <img
                    :src="favicon(n.url)"
                    alt=""
                    class="h-4 w-4 rounded-sm ring-1 ring-white/10 object-cover"
                    loading="lazy"
                  />
                  <span class="text-white/80">{{ n.source }}</span>
                </div>
              </td>

              <td class="px-4 py-3 hidden sm:table-cell">
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="t in (n.tickers || []).slice(0, 4)"
                    :key="t"
                    class="px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10 text-[11px]"
                  >
                    {{ t }}
                  </span>
                </div>
              </td>

              <td class="px-4 py-3 whitespace-nowrap">
                <span class="text-white/70">{{ timeAgo(n.published_at) }}</span>
                <span
                  v-if="!isRead(n.id)"
                  class="ml-2 inline-block align-middle h-2 w-2 rounded-full bg-rose-400"
                />
              </td>

              <td class="px-4 py-3 hidden md:table-cell tabular-nums">
                <span class="text-white/80">{{ (n.score ?? 0).toFixed(0) }}</span>
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
          :total="total"
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
import { useAsyncData } from '#app'

type NewsItem = {
  id: string
  title: string
  url: string
  source: string
  published_at: string
  summary?: string
  tickers?: string[]
  score?: number
  category?: string
  tags?: string[]
}

const q = ref('')
const cat = ref<'unread' | 'favorites' | 'all'>('all')
const tag = ref<'all' | 'trending' | 'breaking' | 'research' | 'opinion' | string>('all')

function onSearch(v: string) {
  q.value = (v ?? '').trim()
}
function onFilterChange(p: { category: string; tag: string }) {
  cat.value = (p.category as any) || 'all'
  tag.value = (p.tag as any) || 'all'
}

const newsCats = [
  { label: 'Unread', value: 'unread' },
  { label: 'Favorites', value: 'favorites' },
  { label: 'All', value: 'all' },
]
const newsTags = [
  { label: 'All', value: 'all', cat: 'all' },
  { label: 'Trending', value: 'trending', cat: 'all' },
  { label: 'Breaking (24h)', value: 'breaking', cat: 'all' },
]

const { data: all, pending } = useAsyncData<NewsItem[]>('news:list', () => $fetch('/news.json'), {
  server: true,
  default: () => [],
})

const norm = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

const in24h = (iso: string) => {
  const t = new Date(iso).getTime()
  return t >= Date.now() - 24 * 3600 * 1000
}
const hasTag = (n: NewsItem, t: string) => (n.tags || []).map(norm).includes(norm(t))

const FAV_KEY = 'favNews:v1'
const READ_KEY = 'news:read'

const fav = ref<Set<string>>(new Set())
const read = ref<Set<string>>(new Set())

function loadLS() {
  if (import.meta.server) return
  try {
    fav.value = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'))
  } catch {}
  try {
    read.value = new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'))
  } catch {}
}
function saveFav() {
  if (import.meta.server) return
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...fav.value]))
  } catch {}
}
function saveRead() {
  if (import.meta.server) return
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...read.value]))
  } catch {}
}
function isFav(id: string) {
  return fav.value.has(id)
}
function toggleFav(id: string) {
  if (fav.value.has(id)) fav.value.delete(id)
  else fav.value.add(id)
  saveFav()
}
function isRead(id: string) {
  return read.value.has(id)
}
function markRead(id: string) {
  if (read.value.has(id)) return
  read.value.add(id)
  saveRead()
}
onMounted(loadLS)

const filtered = computed<NewsItem[]>(() => {
  const qn = norm(q.value)
  const base = (all.value || [])
    .filter((n) => {
      if (cat.value === 'favorites') return fav.value.has(n.id)
      if (cat.value === 'unread') return !read.value.has(n.id)
      return true
    })
    .filter((n) => {
      if (tag.value === 'breaking') return in24h(n.published_at)
      if (tag.value === 'research') return hasTag(n, 'research')
      if (tag.value === 'opinion') return hasTag(n, 'opinion')
      return true
    })
    .filter((n) => {
      if (!qn) return true
      const hay = `${n.title} ${n.summary || ''} ${(n.tickers || []).join(' ')} ${n.source}`
      return norm(hay).includes(qn)
    })

  if (tag.value === 'trending') {
    return base.sort(
      (a, b) =>
        (b.score ?? 0) - (a.score ?? 0) || +new Date(b.published_at) - +new Date(a.published_at),
    )
  }
  return base.sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
})

const sortBy = ref<'time' | 'score'>('time')
function toggleSort(k: 'time' | 'score') {
  sortBy.value = k
}
const sorted = computed<NewsItem[]>(() => {
  const arr = [...filtered.value]
  if (sortBy.value === 'score')
    arr.sort(
      (a, b) =>
        (b.score ?? 0) - (a.score ?? 0) || +new Date(b.published_at) - +new Date(a.published_at),
    )
  else arr.sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
  return arr
})

const page = ref(1)
const perPage = ref(20)
const total = computed(() => sorted.value.length)
const start = computed(() => (page.value - 1) * perPage.value)
const pageItems = computed(() => sorted.value.slice(start.value, start.value + perPage.value))

watch([filtered, perPage], () => {
  page.value = 1
})

function open(n: NewsItem) {
  markRead(n.id)
  window.open(n.url, '_blank', 'noopener,noreferrer')
}

const headerTitle = computed(() => {
  if (cat.value === 'unread') return 'Unread News'
  if (cat.value === 'favorites') return 'Favorite News'
  return 'All News'
})

function timeAgo(iso: string) {
  const d = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - d)
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const dd = Math.floor(h / 24)
  return `${dd}d`
}
function favicon(u: string) {
  try {
    const host = new URL(u).hostname
    return `https://icons.duckduckgo.com/ip3/${host}.ico`
  } catch {
    return `https://icons.duckduckgo.com/ip3/example.com.ico`
  }
}
</script>
