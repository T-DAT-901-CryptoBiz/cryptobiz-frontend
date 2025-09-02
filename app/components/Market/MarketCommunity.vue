<template>
  <aside class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span
          class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10"
        >
          <Icon name="lucide:messages-square" class="h-4 w-4 text-white/70" />
        </span>
        <h3 class="font-semibold tracking-tight">Community</h3>
      </div>

      <div class="flex items-center gap-2">
        <div class="inline-flex rounded-xl bg-white/5 p-0.5 ring-1 ring-white/10">
          <button
            v-for="opt in segments"
            :key="opt.value"
            class="px-3 py-1.5 text-xs rounded-lg transition-all inline-flex items-center gap-1.5"
            :class="
              segment === opt.value
                ? 'bg-white/20 text-white shadow-inner ring-1 ring-white/10'
                : 'text-white/70 hover:bg-white/10'
            "
            @click="onSegment(opt.value)"
          >
            <Icon
              :name="opt.value === 'top' ? 'lucide:flame' : 'lucide:clock'"
              class="h-3.5 w-3.5"
            />
            {{ opt.label }}
          </button>
        </div>

        <div v-if="segment === 'top'" class="relative">
          <Icon
            name="lucide:calendar-clock"
            class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60"
          />
          <select
            v-model="t"
            class="appearance-none text-xs rounded-md bg-white/5 border border-white/10 pl-7 pr-7 py-1 h-8 leading-none"
            aria-label="Time range"
          >
            <option value="hour">1h</option>
            <option value="day">24h</option>
            <option value="week">7d</option>
            <option value="month">30d</option>
            <option value="year">1y</option>
            <option value="all">All</option>
          </select>
          <Icon
            name="lucide:chevron-down"
            class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60"
          />
        </div>
      </div>
    </div>

    <!-- Scrollable list -->
    <div
      ref="scrollWrap"
      class="p-3 max-h-[460px] overflow-y-auto pr-1 custom-scroll"
      :aria-busy="(pending && !posts.length) || showMoreSpinner"
    >
      <!-- Skeletons -->
      <div v-if="pending && !posts.length" class="space-y-2">
        <div v-for="i in 5" :key="i" class="flex gap-3 p-3 rounded-lg bg-white/5">
          <div class="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
          <div class="flex-1 space-y-2">
            <div class="h-4 rounded bg-white/10 animate-pulse w-3/4" />
            <div class="h-3 rounded bg-white/10 animate-pulse w-2/3" />
            <div class="h-20 w-28 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Posts -->
      <ul v-else class="space-y-2">
        <li v-for="p in visiblePosts" :key="p.id">
          <a
            :href="p.permalink || p.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group grid grid-cols-[40px,1fr,auto] items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <img
              :src="subIcon(p.subreddit)"
              alt=""
              class="h-10 w-10 rounded-full ring-1 ring-white/10 object-cover"
              loading="lazy"
              decoding="async"
            />

            <div class="min-w-0">
              <div class="flex items-center gap-2 text-xs text-white/60">
                <img
                  :src="userAvatar(p.author)"
                  alt=""
                  class="h-4 w-4 rounded-full ring-1 ring-white/10 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <span class="truncate">u/{{ p.author }}</span>
                <span>•</span>
                <span class="truncate">r/{{ p.subreddit }}</span>
                <span>•</span>
                <span>{{ timeAgo(p.created_utc) }}</span>
              </div>

              <div class="mt-1 font-medium leading-snug line-clamp-2 group-hover:underline">
                {{ p.title }}
              </div>

              <p v-if="snippet(p)" class="mt-1 text-sm text-white/70 line-clamp-3">
                {{ snippet(p) }}
              </p>

              <div v-if="p.thumbnail" class="mt-2">
                <img
                  :src="p.thumbnail"
                  alt=""
                  class="h-20 w-28 md:h-24 md:w-36 rounded-lg object-cover ring-1 ring-white/10"
                  loading="lazy"
                  decoding="async"
                  style="image-rendering: -webkit-optimize-contrast"
                />
              </div>

              <div class="mt-2 text-xs text-white/70 flex items-center gap-4">
                <span class="inline-flex items-center gap-1">
                  <Icon name="lucide:arrow-up" class="h-4 w-4" />
                  {{ p.score.toLocaleString() }}
                </span>
                <span class="inline-flex items-center gap-1">
                  <Icon name="lucide:message-square" class="h-4 w-4" />
                  {{ p.num_comments.toLocaleString() }}
                </span>
              </div>
            </div>

            <Icon name="lucide:external-link" class="h-4 w-4 opacity-50 group-hover:opacity-80" />
          </a>
        </li>

        <!-- Loader + sentinel (affichés uniquement si on peut paginer) -->
        <li v-if="showMoreSpinner" class="py-3">
          <div class="flex items-center justify-center gap-2 text-xs text-white/70">
            <div
              class="h-5 w-5 rounded-full border-2 border-white/30 border-t-transparent animate-spin"
            />
            Loading more…
          </div>
        </li>
        <li v-if="canPaginate" ref="sentinel" class="h-1" aria-hidden="true" />
      </ul>

      <!-- Empty state -->
      <div v-if="!pending && !posts.length" class="p-6 text-center">
        <div
          class="mx-auto h-11 w-11 rounded-xl bg-white/5 ring-1 ring-white/10 grid place-items-center"
        >
          <Icon name="lucide:message-square-off" class="h-5 w-5 text-white/70" />
        </div>
        <div class="mt-3 font-medium">Nothing here yet</div>
        <p class="mt-1 text-xs text-white/60">
          Try changing the filter or time period to see more posts.
        </p>
        <div class="mt-3 flex items-center justify-center gap-2">
          <button
            @click="refreshFeed"
            class="px-3 py-1.5 text-xs rounded-md bg-white/10 hover:bg-white/15 ring-1 ring-white/10"
          >
            Refresh
          </button>
          <button
            @click="toggleSegment"
            class="px-3 py-1.5 text-xs rounded-md bg-white/5 hover:bg-white/10 ring-1 ring-white/10 text-white/80"
          >
            Switch to {{ segment === 'top' ? 'Latest' : 'Top' }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import {
  useRedditPublic,
  type Sort,
  type TimeRange,
  type RedditPost,
} from '~/composables/useRedditPublic'

const props = withDefaults(defineProps<{ symbol: string; loaderDelayMs?: number }>(), {
  loaderDelayMs: 2000,
})

const refreshFeed = () => {
  feed.value?.refresh?.()
}

const toggleSegment = () => {
  segment.value = segment.value === 'top' ? 'latest' : 'top'
  visible.value = 5
}

/* Subreddits */
const base = computed(() =>
  String(props.symbol || '').replace(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/i, ''),
)
const baseU = computed(() => base.value.toUpperCase())
const SUBS: Record<string, string[]> = {
  BTC: ['Bitcoin'],
  ETH: ['ethereum', 'ethtrader'],
  SOL: ['solana'],
  BNB: ['binance'],
  XRP: ['Ripple'],
  ADA: ['cardano'],
  DOGE: ['dogecoin'],
  AVAX: ['Avax', 'avalanche'],
  MATIC: ['0xPolygon', 'polygon'],
  DOT: ['polkadot'],
  TRX: ['Tronix', 'tronix'],
  LTC: ['litecoin'],
  LINK: ['chainlink'],
  ATOM: ['cosmosnetwork'],
  OP: ['optimism'],
  ARB: ['arbitrum'],
  NEAR: ['nearprotocol'],
  ALGO: ['algorand'],
  ETC: ['ethereumclassic'],
  BCH: ['Bitcoincash'],
  FIL: ['Filecoin'],
  APT: ['aptos'],
  SUI: ['SuiNetwork'],
  XLM: ['Stellar'],
  VET: ['vechain'],
  QTUM: ['Qtum'],
  NEO: ['NEO'],
  IOTA: ['IOTA'],
  ONT: ['Ontology'],
  ICX: ['iconproject'],
  TUSD: ['TrueUSD'],
}
const usedSubs = computed<string[]>(() => {
  const preset = SUBS[baseU.value]
  if (preset?.length) return preset
  const guess = base.value.toLowerCase()
  return [guess, `${guess}crypto`, 'CryptoCurrency', 'CryptoMarkets']
})

/* Segments */
type Segment = 'top' | 'latest'
const segments: Array<{ label: string; value: Segment }> = [
  { label: 'Top', value: 'top' },
  { label: 'Latest', value: 'latest' },
]
const segment = ref<Segment>('latest')
const t = ref<TimeRange>('day')

/* Feed */
const fetchLimit = ref(20)
type Feed = ReturnType<typeof useRedditPublic> | null
const feed = shallowRef<Feed>(null)
const pending = computed<boolean>(() => feed.value?.pending.value ?? true)
const posts = computed<RedditPostExtended[]>(
  () => (feed.value?.posts.value as RedditPostExtended[]) ?? [],
)
function sortFromSegment(s: Segment): Sort {
  return s === 'top' ? 'top' : 'new'
}
function mountFeed() {
  feed.value = useRedditPublic({
    subreddits: usedSubs.value,
    sort: sortFromSegment(segment.value),
    t: t.value,
    limit: fetchLimit.value,
  })
}
watch([usedSubs, segment, t, fetchLimit], () => mountFeed(), { immediate: true })

/* Pagination + guards */
const visible = ref(5)
const visiblePosts = computed(() => posts.value.slice(0, visible.value))

const loadingMore = ref(false)
const canPaginate = computed(() => posts.value.length > 1)
const showMoreSpinner = computed(() => loadingMore.value && canPaginate.value)

/* Scroll infra (sans globals) */
type ScrollEl = {
  scrollTop: number
  clientHeight: number
  scrollHeight: number
  addEventListener: (
    type: string,
    listener: (e: unknown) => void,
    opts?: { passive?: boolean },
  ) => void
  removeEventListener: (type: string, listener: (e: unknown) => void) => void
}
const scrollWrap = ref<ScrollEl | null>(null)
const sentinel = ref<unknown | null>(null)

type IOInstance = {
  observe: (el: unknown) => void
  unobserve: (el: unknown) => void
  disconnect: () => void
}
type IOCtor = new (
  cb: (entries: Array<{ isIntersecting: boolean; intersectionRatio?: number }>) => void,
  options?: { root?: unknown; rootMargin?: string; threshold?: number | number[] },
) => IOInstance
let io: IOInstance | null = null

function isAtHardBottom(el: ScrollEl): boolean {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - 2
}
function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    const g = globalThis as unknown as { setTimeout?: (cb: () => void, ms?: number) => number }
    g.setTimeout?.(resolve, ms)
  })
}

async function loadMore() {
  if (loadingMore.value) return
  if (!canPaginate.value) return
  const wrap = scrollWrap.value
  if (!wrap || !isAtHardBottom(wrap)) return

  loadingMore.value = true
  if (io && sentinel.value) io.unobserve(sentinel.value)

  await sleep(props.loaderDelayMs)

  visible.value += 5
  const needMore = visible.value > posts.value.length - 2
  if (needMore) {
    fetchLimit.value = Math.min(fetchLimit.value + 20, 100)
    const stop = watch(
      () => pending.value,
      async (p) => {
        if (!p) {
          stop()
          loadingMore.value = false
          await nextTick()
          if (io && sentinel.value && canPaginate.value) io.observe(sentinel.value)
        }
      },
      { immediate: true },
    )
  } else {
    loadingMore.value = false
    await nextTick()
    if (io && sentinel.value && canPaginate.value) io.observe(sentinel.value)
  }
}

onMounted(async () => {
  const IOC = (globalThis as unknown as { IntersectionObserver?: IOCtor }).IntersectionObserver
  if (IOC) {
    io = new IOC(
      (entries) => {
        const e = entries[0]
        if (e && e.isIntersecting && (e.intersectionRatio ?? 1) >= 0.98) loadMore()
      },
      { root: scrollWrap.value || null, rootMargin: '0px', threshold: 0.98 },
    )
    await nextTick()
    if (sentinel.value && canPaginate.value) io.observe(sentinel.value)
  }

  const onScroll = () => {
    if (!scrollWrap.value) return
    if (isAtHardBottom(scrollWrap.value)) loadMore()
  }
  scrollWrap.value?.addEventListener('scroll', onScroll, { passive: true })

  onBeforeUnmount(() => {
    scrollWrap.value?.removeEventListener('scroll', onScroll)
  })
})

onBeforeUnmount(() => {
  if (io) {
    io.disconnect()
    io = null
  }
})

watch([sentinel, () => posts.value.length, canPaginate], async () => {
  await nextTick()
  if (io) {
    if (sentinel.value && canPaginate.value) io.observe(sentinel.value)
    else if (sentinel.value) io.unobserve(sentinel.value)
  }
})

/* UI helpers */
function timeAgo(epochSec: number): string {
  const diff = Math.max(0, Date.now() - epochSec * 1000)
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}
function subIcon(sr: string): string {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(sr)}`
}
function userAvatar(author: string): string {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(author)}`
}
function onSegment(s: Segment) {
  if (segment.value !== s) {
    segment.value = s
    visible.value = 5
  }
}

type RedditPostExtended = RedditPost & { selftext?: string | null }
function snippet(p: RedditPostExtended): string | null {
  const txt = (p.selftext || '').replace(/\s+/g, ' ').trim()
  if (!txt) return null
  return txt.length > 180 ? txt.slice(0, 180) + '…' : txt
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
</style>
