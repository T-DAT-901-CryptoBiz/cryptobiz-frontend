<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold">BTC Dominance</h3>
        <p class="text-xs text-white/60 mt-0.5">24h Volume</p>
      </div>
      <NuxtLink
        to="/asset/BTCUSDT"
        class="text-xs text-white/60 hover:text-white/90 transition-colors"
      >
        See BTC →
      </NuxtLink>
    </header>

    <div v-if="pending" class="space-y-4">
      <div class="h-8 w-32 rounded bg-white/10 animate-pulse"></div>
      <div class="h-32 rounded bg-white/10 animate-pulse"></div>
      <div class="space-y-2">
        <div class="h-12 rounded-lg bg-white/10 animate-pulse"></div>
        <div class="h-12 rounded-lg bg-white/10 animate-pulse"></div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <!-- Main percentage display -->
      <div class="text-center">
        <div class="text-4xl font-bold tabular-nums mb-1">
          <span :style="{ color: colors.btc }">{{ pct.toFixed(1) }}%</span>
        </div>
        <div class="text-xs text-white/60">of total stable-quoted volume</div>
      </div>

      <!-- SVG Arc Chart -->
      <div class="relative mx-auto w-full max-w-[360px] py-4">
        <svg viewBox="0 0 100 60" class="w-full" xmlns="http://www.w3.org/2000/svg">
          <!-- Background arc -->
          <path
            :d="bgArc"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            stroke-width="6"
            stroke-linecap="round"
          />

          <!-- BTC dominance arc -->
          <path
            :d="bgArc"
            fill="none"
            :stroke="colors.btc"
            stroke-width="6"
            stroke-linecap="round"
            :pathLength="100"
            :stroke-dasharray="`${pctClamped} ${100 - pctClamped}`"
            stroke-dashoffset="0"
            class="transition-all duration-1000 ease-out"
          />

          <!-- Needle indicator -->
          <circle
            v-if="pctClamped > 0.5"
            :cx="needle.x"
            :cy="needle.y"
            r="2"
            :fill="colors.btc"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="0.5"
            class="transition-all duration-1000 ease-out"
          />

          <!-- Scale markers -->
          <text x="5" y="58" font-size="3" fill="rgba(255,255,255,0.5)">0%</text>
          <text x="47" y="58" font-size="3" fill="rgba(255,255,255,0.5)" text-anchor="middle">
            50%
          </text>
          <text x="95" y="58" font-size="3" fill="rgba(255,255,255,0.5)" text-anchor="end">
            100%
          </text>
        </svg>
      </div>

      <!-- Volume breakdown -->
      <div class="space-y-2">
        <!-- BTC Volume -->
        <div
          class="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div
              class="h-3 w-3 rounded-full flex-shrink-0"
              :style="{ backgroundColor: colors.btc }"
            />
            <div>
              <div class="font-semibold text-sm">BTC</div>
              <div class="text-xs text-white/60">Bitcoin volume</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold tabular-nums">${{ btcVolFmt }}</div>
            <div class="text-xs text-white/60">
              {{ ((btcVol / totalStable) * 100 || 0).toFixed(2) }}%
            </div>
          </div>
        </div>

        <!-- Others Volume -->
        <div
          class="rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between hover:bg-white/10 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div
              class="h-3 w-3 rounded-full flex-shrink-0"
              :style="{ backgroundColor: colors.others }"
            />
            <div>
              <div class="font-semibold text-sm">Others</div>
              <div class="text-xs text-white/60">All other assets</div>
            </div>
          </div>
          <div class="text-right">
            <div class="font-semibold tabular-nums">${{ othersVolFmt }}</div>
            <div class="text-xs text-white/60">
              {{ ((othersVol / totalStable) * 100 || 0).toFixed(2) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- Total volume -->
      <div class="pt-2 border-t border-white/10">
        <div class="flex items-center justify-between text-sm">
          <span class="text-white/60">Total 24h Volume</span>
          <span class="font-semibold tabular-nums">${{ totalStableFmt }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { ExchangeInfo } from '~/types/binance'

const { rows, pending, refresh } = useAll24h()
const { exchangeInfo } = useBinanceMarket()

const sym2Base = ref<Record<string, string>>({})
const sym2Quote = ref<Record<string, string>>({})

let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  const r = await exchangeInfo()
  await r.refresh()
  const b: Record<string, string> = {}
  const q: Record<string, string> = {}
  type Sym = ExchangeInfo['symbols'][number]
  r.data.value?.symbols?.forEach((s: Sym) => {
    b[s.symbol] = s.baseAsset
    q[s.symbol] = s.quoteAsset
  })
  sym2Base.value = b
  sym2Quote.value = q

  // Refresh data every 30 seconds
  if (import.meta.client) {
    refreshInterval = setInterval(() => {
      void refresh()
    }, 30000)
  }
})

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

const stable = new Set(['USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD'])
const pctClamped = computed(() => Math.max(0, Math.min(100, pct.value)))

const btcVol = computed(() =>
  rows.value.reduce((acc, r) => {
    const base = sym2Base.value[r.symbol]
    const quote = sym2Quote.value[r.symbol]
    if (base === 'BTC' && stable.has(quote)) acc += Number(r.quoteVolume || 0)
    return acc
  }, 0),
)

const totalStable = computed(() =>
  rows.value.reduce((acc, r) => {
    const quote = sym2Quote.value[r.symbol]
    if (stable.has(quote)) acc += Number(r.quoteVolume || 0)
    return acc
  }, 0),
)

const othersVol = computed(() => Math.max(0, totalStable.value - btcVol.value))

const pct = computed(() => {
  const t = totalStable.value || 1
  return (btcVol.value / t) * 100
})

const totalStableFmt = computed(() =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(totalStable.value),
)
const btcVolFmt = computed(() =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(btcVol.value),
)
const othersVolFmt = computed(() =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(othersVol.value),
)

// SVG arc configuration
const R = 42
const CX = 50
const CY = 50

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (Math.PI / 180) * angleDeg
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(CX, CY, R, startAngle)
  const end = polarToCartesian(CX, CY, R, endAngle)
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
  const sweep = 1
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`
}

const bgArc = computed(() => arcPath(180, 0))

const needle = computed(() => {
  const clamped = Math.max(0, Math.min(100, pct.value))
  const angle = 180 - (clamped / 100) * 180
  return polarToCartesian(CX, CY, R, angle)
})

const colors = {
  btc: '#f59e0b',
  others: '#6b7280',
}
</script>
