<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">BTC Dominance (24h volume)</h3>
      <NuxtLink to="/asset/BTCUSDT" class="text-xs text-white/60 hover:text-white/90"
        >See BTC</NuxtLink
      >
    </header>

    <div v-if="pending" class="space-y-3">
      <div class="h-7 w-28 rounded bg-white/10 animate-pulse"></div>
      <div class="h-28 rounded bg-white/10 animate-pulse"></div>
      <div class="h-4 w-1/2 rounded bg-white/10 animate-pulse"></div>
      <div class="h-4 w-1/3 rounded bg-white/10 animate-pulse"></div>
    </div>

    <div v-else class="space-y-3">
      <div class="flex items-end justify-between">
        <div>
          <div class="text-2xl font-semibold tabular-nums">{{ pct.toFixed(1) }}%</div>
          <div class="text-xs text-white/60">of stable-quoted volume</div>
        </div>
        <div class="text-xs text-white/60">Total: ${{ totalStableFmt }}</div>
      </div>

      <div class="relative mx-auto w-full max-w-[420px]">
        <svg viewBox="0 0 100 60" class="w-full">
          <path
            :d="bgArc"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            stroke-width="8"
            stroke-linecap="round"
          />

          <path
            :d="bgArc"
            fill="none"
            :stroke="colors.btc"
            stroke-width="8"
            stroke-linecap="round"
            :pathLength="100"
            :stroke-dasharray="pctClamped + ' ' + (100 - pctClamped)"
            stroke-dashoffset="0"
          />
          <circle
            v-if="pctClamped > 0.2"
            :cx="needle.x"
            :cy="needle.y"
            r="1.8"
            :fill="colors.btc"
            stroke="rgba(255,255,255,0.2)"
            stroke-width="0.6"
          />
          <text x="5" y="58" font-size="3.2" fill="rgba(255,255,255,0.6)">0%</text>
          <text x="90" y="58" font-size="3.2" fill="rgba(255,255,255,0.6)" text-anchor="end">
            100%
          </text>
        </svg>
      </div>

      <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <li
          class="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 flex items-center justify-between"
        >
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colors.btc }" />
            <span class="font-medium">BTC</span>
          </span>
          <span class="tabular-nums">${{ btcVolFmt }}</span>
        </li>
        <li
          class="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 flex items-center justify-between"
        >
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: colors.others }" />
            <span class="font-medium">Others</span>
          </span>
          <span class="tabular-nums">${{ othersVolFmt }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { ExchangeInfo } from '~/types/binance'

const { rows, pending } = useAll24h()
const { exchangeInfo } = useBinanceMarket()

const sym2Base = ref<Record<string, string>>({})
const sym2Quote = ref<Record<string, string>>({})

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

const pct = computed(() => {
  const t = totalStable.value || 1
  return (btcVol.value / t) * 100
})

const totalStableFmt = computed(() => Math.round(totalStable.value).toLocaleString())
const btcVolFmt = computed(() => Math.round(btcVol.value).toLocaleString())
const othersVolFmt = computed(() =>
  Math.round(Math.max(0, totalStable.value - btcVol.value)).toLocaleString(),
)

const R = 40
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
  others: '#3b82f6',
}
</script>
