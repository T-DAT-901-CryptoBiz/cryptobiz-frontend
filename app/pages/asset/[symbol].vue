<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-white/5 bg-neutral-900/60 p-4">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/markets"
            class="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
            aria-label="Back to markets"
          >
            <Icon name="lucide:chevron-left" class="h-4 w-4" />
            Markets
          </NuxtLink>

          <div class="flex items-center gap-3">
            <ui-coin-logo :asset="base" :size="28" />
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl md:text-2xl font-semibold leading-none">{{ base }}</h1>
                <span class="text-xs rounded-md px-2 py-0.5 bg-white/10 text-white/70">
                  / {{ quote }}
                </span>
              </div>
              <div class="text-xs text-white/40">{{ symbol }}</div>
            </div>
          </div>
        </div>

        <div class="flex items-end gap-6">
          <div class="text-right">
            <div class="text-3xl font-bold tabular-nums leading-tight">
              <span v-if="!pending">${{ price.toLocaleString() }}</span>
              <span v-else class="inline-block h-8 w-32 rounded bg-white/10 animate-pulse"></span>
            </div>
            <div class="mt-1">
              <span
                v-if="!pending"
                class="inline-flex items-center px-2 py-0.5 rounded-md text-sm tabular-nums"
                :class="isUp ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'"
              >
                <Icon
                  :name="isUp ? 'lucide:trending-up' : 'lucide:trending-down'"
                  class="h-4 w-4 mr-1"
                />
                {{ change.toFixed(2) }}% (24h)
              </span>
              <span v-else class="inline-block h-5 w-28 rounded bg-white/10 animate-pulse"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-1 gap-6">
      <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
        <ClientOnly>
          <ChartsTvAdvancedChart
            :symbol="tvSymbol"
            :interval="interval === '1h' ? '60' : interval.replace('m', '')"
            theme="dark"
          />
          <template #fallback>
            <div class="h-[420px] grid place-items-center">Chargement du chart…</div>
          </template>
        </ClientOnly>
      </div>

      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <MarketAssetOverview :symbol="symbol" />
          <ClientOnly>
            <MarketCommunity :symbol="symbol" />
          </ClientOnly>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <MarketPerformanceChips class="lg:col-span-2 h-full" :symbol="symbol" :height="300" />
      <MarketBidAsk :symbol="symbol" :height="350" />
    </div>

    <div class="grid grid-cols-1 2xl:grid-cols-2 gap-6">
      <div class="grid grid-cols-1 gap-6">
        <MarketOrderBook :symbol="symbol" :limit="50" :height="320" />
        <MarketDepthChart :symbol="symbol" :limit="50" :height="320" />
      </div>
      <div class="grid grid-cols-1 gap-6">
        <MarketRecentTrades :symbol="symbol" :limit="50" :height="320" />
        <MarketWhaleTrades :symbol="symbol" :limit="50" :height="320" />
      </div>
    </div>

    <MarketPairsForBase :base="base" />
  </div>
</template>

<script setup lang="ts">
import type { Interval } from '~/types/binance'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTicker } from '~/composables/useTicker'
import { useBinanceWS } from '~/composables/useBinanceWS'

const route = useRoute()
const symbol = computed(() => String(route.params.symbol || 'BTCUSDT'))
const tvSymbol = computed(() => `BINANCE:${symbol.value}`)
const interval = ref<Interval>('1h')

const { data: t, pending } = useTicker(symbol.value)

const base = computed(() => String(symbol.value).replace(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/, ''))
const quote = computed(
  () => String(symbol.value).match(/USDT|FDUSD|USDC|BUSD|TUSD|USD$/)?.[0] ?? '',
)

const { connect } = useBinanceWS()
const livePrice = ref<number | null>(null)
const liveChange = ref<number | null>(null)
let stop: (() => void) | null = null

interface MiniTickerWS {
  c: string
  o?: string
  P?: string
}
function isMiniTickerWS(x: unknown): x is MiniTickerWS {
  if (!x || typeof x !== 'object') return false
  const v = x as Record<string, unknown>
  return typeof v.c === 'string'
}

const restLast = computed(() => Number(t.value?.lastPrice ?? NaN))
const restPct = computed(() => Number(t.value?.priceChangePercent ?? NaN))
const restOpen = computed(() => {
  const L = restLast.value,
    P = restPct.value
  return Number.isFinite(L) && Number.isFinite(P) ? L / (1 + P / 100) : NaN
})

function openMiniTicker() {
  if (import.meta.server) return
  stop?.()
  livePrice.value = null
  liveChange.value = null

  stop = connect(`${symbol.value.toLowerCase()}@miniTicker`, {
    onMessage: (msg) => {
      if (!isMiniTickerWS(msg)) return

      const c = Number(msg.c)
      livePrice.value = Number.isFinite(c) ? c : null

      if (typeof msg.P === 'string') {
        const p = Number(msg.P)
        if (Number.isFinite(p)) liveChange.value = p
        return
      }

      const oWS = msg.o !== undefined ? Number(msg.o) : NaN
      const open = Number.isFinite(oWS) ? oWS : restOpen.value
      if (Number.isFinite(open) && Number.isFinite(c) && open > 0) {
        liveChange.value = (c / open - 1) * 100
      }
    },
  })
}

onMounted(openMiniTicker)
onBeforeUnmount(() => stop?.())
watch(() => symbol.value, openMiniTicker)

const price = computed(() => livePrice.value ?? Number(t.value?.lastPrice ?? 0))
const change = computed(() => liveChange.value ?? Number(t.value?.priceChangePercent ?? 0))
const isUp = computed(() => change.value >= 0)
</script>
