<template>
  <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-white/80">Most Mentioned</span>
        <span class="text-xs text-white/50" v-if="!pending">Top 5</span>
      </div>

      <div v-if="pending" class="space-y-3">
        <div v-for="i in 5" :key="'sym-skel-' + i" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-5 w-5 rounded-full bg-white/10 animate-pulse" />
            <div class="h-3 w-20 rounded bg-white/10 animate-pulse" />
          </div>
          <div class="h-3 w-10 rounded bg-white/10 animate-pulse" />
        </div>
      </div>

      <ul v-else class="space-y-3">
        <li v-for="(it, i) in topSyms5" :key="it.sym" class="flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <ui-coin-logo :asset="it.sym" :size="20" />
            <div class="truncate text-sm">
              <NuxtLink
                :to="`/asset/${it.sym + 'USDT'}`"
                class="font-medium hover:underline"
                :title="it.sym"
              >
                {{ it.sym }}
              </NuxtLink>
              <span class="text-xs text-white/50 ml-1" v-if="it.share > 0">
                ({{ it.share.toFixed(1) }}%)
              </span>
            </div>
          </div>
          <div class="tabular-nums text-sm text-white/80">{{ it.count.toLocaleString() }}</div>
        </li>
        <li v-if="!topSyms5.length" class="text-sm text-white/60">No data</li>
      </ul>
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-white/80">Top Sources</span>
        <span class="text-xs text-white/50" v-if="!pending">Top 5</span>
      </div>

      <div v-if="pending" class="space-y-3">
        <div v-for="i in 5" :key="'src-skel-' + i" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="h-4 w-4 rounded bg-white/10 animate-pulse" />
            <div class="h-3 w-28 rounded bg-white/10 animate-pulse" />
          </div>
          <div class="h-3 w-10 rounded bg-white/10 animate-pulse" />
        </div>
      </div>

      <ul v-else class="space-y-3">
        <li v-for="(s, i) in topSrc5" :key="s.host" class="flex items-center justify-between">
          <div class="flex items-center gap-2 min-w-0">
            <img
              :src="faviconFromHost(s.host)"
              alt=""
              class="h-4 w-4 rounded-sm ring-1 ring-white/10 object-cover"
              loading="lazy"
            />
            <a
              :href="`https://${s.host}`"
              target="_blank"
              rel="noopener noreferrer"
              class="truncate text-sm hover:underline"
            >
              {{ s.host }}
            </a>
          </div>
          <div class="tabular-nums text-sm text-white/80">{{ s.count.toLocaleString() }}</div>
        </li>
        <li v-if="!topSrc5.length" class="text-sm text-white/60">No source data</li>
      </ul>
    </div>

    <div class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-white/80">Overview</span>
      </div>

      <div v-if="pending" class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-white/60">Last 24h</span>
          <div class="h-5 w-16 rounded bg-white/10 animate-pulse" />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-white/60">Total Articles</span>
          <div class="h-5 w-20 rounded bg-white/10 animate-pulse" />
        </div>
      </div>

      <div v-else class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-white/70">Last 24h</span>
          <span class="text-xl font-semibold tabular-nums">
            {{ last24hCount.toLocaleString() }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-white/70">Total Articles</span>
          <span class="text-xl font-semibold tabular-nums">
            {{ total.toLocaleString() }}
          </span>
        </div>
        <div v-if="latest" class="pt-2 border-t border-white/10">
          <div class="text-xs text-white/50 mb-1">Latest</div>
          <a
            :href="latest.link"
            target="_blank"
            rel="noopener"
            class="block text-sm font-medium hover:underline truncate"
          >
            {{ latest.title }}
          </a>
          <div class="text-xs text-white/60 mt-0.5">
            {{ timeAgo(latest.publish_date) }} • {{ host(latest.link) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useArticleStats } from '~/composables/useArticles'

const { pending, total, last24hCount, topCategories, sourcesAgg, latest } = useArticleStats()

const topSyms5 = computed(() => {
  const arr = (topCategories.value || []).slice(0, 5)
  const sum = arr.reduce((a, [, n]) => a + (Number(n) || 0), 0) || 1
  return arr.map(([sym, n]) => ({
    sym,
    count: Number(n) || 0,
    share: ((Number(n) || 0) / sum) * 100,
  }))
})

const topSrc5 = computed(() =>
  (sourcesAgg.value || []).slice(0, 5).map(([h, n]) => ({ host: h, count: Number(n) || 0 })),
)

function faviconFromHost(host: string) {
  try {
    const h = host.includes('://') ? new URL(host).hostname : host
    return `https://icons.duckduckgo.com/ip3/${h.replace(/^www\./, '')}.ico`
  } catch {
    return `https://icons.duckduckgo.com/ip3/example.com.ico`
  }
}

function timeAgo(iso: string) {
  const t = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - t)
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}
function host(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
</script>
