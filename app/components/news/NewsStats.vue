<template>
  <section class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5 space-y-4">
    <header class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">News Stats</h3>
      <NuxtLink to="/news" class="text-xs text-white/60 hover:text-white/90">News</NuxtLink>
    </header>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="rounded-xl bg-white/5 border border-white/10 p-3">
        <div class="text-xs text-white/60">Total News</div>
        <div class="mt-1 text-2xl font-semibold tabular-nums">
          <span v-if="!pending">{{ total.toLocaleString() }}</span>
          <span
            v-else
            class="inline-block h-7 w-16 rounded bg-white/10 animate-pulse align-middle"
          ></span>
        </div>
      </div>

      <div class="rounded-xl bg-white/5 border border-white/10 p-3">
        <div class="text-xs text-white/60">Last 24h</div>
        <div class="mt-1 text-2xl font-semibold tabular-nums">
          <span v-if="!pending">{{ last24hCount.toLocaleString() }}</span>
          <span
            v-else
            class="inline-block h-7 w-12 rounded bg-white/10 animate-pulse align-middle"
          ></span>
        </div>
      </div>

      <div class="rounded-xl bg-white/5 border border-white/10 p-3">
        <div class="text-xs text-white/60">Top Category</div>
        <div class="mt-1 flex items-center gap-2">
          <ui-coin-logo v-if="topCategories[0]" :asset="topCategories[0][0]" :size="18" />
          <div class="text-lg font-semibold">
            <span v-if="!pending">{{ topCategories[0]?.[0] || '—' }}</span>
            <span v-else class="inline-block h-6 w-16 rounded bg-white/10 animate-pulse"></span>
          </div>
        </div>
        <div class="text-xs text-white/60 mt-0.5" v-if="topCategories[0]">
          {{ topCategories[0][1].toLocaleString() }} articles
        </div>
      </div>

      <div class="rounded-xl bg-white/5 border border-white/10 p-3">
        <div class="text-xs text-white/60">Latest</div>
        <div class="mt-1 text-sm font-medium truncate" :title="latest?.title || ''">
          <a
            v-if="latest"
            :href="latest.link"
            target="_blank"
            rel="noopener"
            class="hover:underline"
          >
            {{ latest.title }}
          </a>
          <span v-else class="inline-block h-5 w-40 rounded bg-white/10 animate-pulse"></span>
        </div>
        <div class="text-xs text-white/60 mt-0.5 flex items-center gap-2" v-if="latest">
          <img
            :src="favicon(latest.link)"
            class="h-3.5 w-3.5 rounded-sm ring-1 ring-white/10 object-cover"
          />
          <span>{{ host(latest.link) }}</span>
          <span>•</span>
          <span>{{ timeAgo(latest.publish_date) }}</span>
        </div>
      </div>
    </div>

    <div class="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold">Last 14 days</h3>
        <div class="text-xs text-white/60">News per day</div>
      </div>

      <div class="h-28 grid grid-cols-14 gap-1 items-end">
        <div
          v-for="d in last14"
          :key="d.date"
          class="relative rounded bg-white/10 hover:bg-white/15 transition"
          :style="{ height: Math.max(2, scale(d.count)) + 'px' }"
          :title="d.date + ' — ' + d.count"
        />
      </div>

      <div class="mt-2 flex justify-between text-[11px] text-white/50">
        <span>{{ last14[0]?.date }}</span>
        <span>{{ last14.at(-1)?.date }}</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Top Categories -->
      <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
        <header class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">Top Categories</h3>
          <span class="text-xs text-white/60">by count</span>
        </header>

        <div v-if="pending" class="space-y-3">
          <div v-for="i in 5" :key="i" class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="h-4 w-4 rounded-full bg-white/10 animate-pulse" />
                <div class="h-4 w-24 rounded bg-white/10 animate-pulse" />
              </div>
              <div class="h-4 w-12 rounded bg-white/10 animate-pulse" />
            </div>
            <div class="h-1.5 w-full rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="([sym, n], i) in topCategories"
            :key="sym"
            class="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <div class="flex-shrink-0">
                  <ui-coin-logo :asset="sym" :size="20" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-white/50 tabular-nums">#{{ i + 1 }}</span>
                    <span class="font-medium text-sm truncate">{{ sym }}</span>
                  </div>
                </div>
              </div>
              <div class="ml-3 text-right flex-shrink-0">
                <div class="text-sm font-semibold tabular-nums text-white/90">
                  {{ n.toLocaleString() }}
                </div>
                <div class="text-[10px] text-white/50">articles</div>
              </div>
            </div>
            <div class="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{
                  width:
                    topCategories.length > 0 && topCategories[0]
                      ? (n / topCategories[0][1]) * 100 + '%'
                      : 0,
                  backgroundColor: '#3b82f6',
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Top Sources -->
      <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
        <header class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">Top Sources</h3>
          <span class="text-xs text-white/60">by count</span>
        </header>

        <div v-if="pending" class="space-y-3">
          <div v-for="i in 5" :key="i" class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="h-4 w-4 rounded bg-white/10 animate-pulse" />
                <div class="h-4 w-28 rounded bg-white/10 animate-pulse" />
              </div>
              <div class="h-4 w-12 rounded bg-white/10 animate-pulse" />
            </div>
            <div class="h-1.5 w-full rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="([hostName, n], i) in topSources"
            :key="hostName"
            class="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <div class="flex-shrink-0">
                  <img
                    :src="favicon('https://' + hostName)"
                    class="h-5 w-5 rounded-sm ring-1 ring-white/10 object-cover"
                    :alt="hostName"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-white/50 tabular-nums">#{{ i + 1 }}</span>
                    <span class="font-medium text-sm truncate">{{ hostName }}</span>
                  </div>
                </div>
              </div>
              <div class="ml-3 text-right flex-shrink-0">
                <div class="text-sm font-semibold tabular-nums text-white/90">
                  {{ n.toLocaleString() }}
                </div>
                <div class="text-[10px] text-white/50">articles</div>
              </div>
            </div>
            <div class="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :style="{
                  width:
                    topSources.length > 0 && topSources[0] ? (n / topSources[0][1]) * 100 + '%' : 0,
                  backgroundColor: '#22c55e',
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useArticleStats } from '~/composables/useArticles'
const { pending, total, last14, last24hCount, topCategories, sourcesAgg, latest } =
  useArticleStats()

const topSources = computed(() => sourcesAgg.value.slice(0, 5))

const maxVal = computed(() => Math.max(1, ...last14.value.map((d) => d.count)))
const scale = (n: number) => Math.round((n / maxVal.value) * 100)

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
function favicon(u: string) {
  try {
    return `https://icons.duckduckgo.com/ip3/${new URL(u).hostname}.ico`
  } catch {
    return `https://icons.duckduckgo.com/ip3/example.com.ico`
  }
}
function host(u: string) {
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
</script>
