<template>
  <section class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
    <header class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">BTC Dominance (24h volume)</h3>
      <NuxtLink to="/asset/BTCUSDT" class="text-xs text-white/60 hover:text-white/90">
        See BTC
      </NuxtLink>
    </header>

    <div v-if="pending" class="space-y-3">
      <div class="h-7 w-24 rounded bg-white/10 animate-pulse"></div>
      <div class="h-3 rounded bg-white/10 animate-pulse"></div>
      <div class="flex items-center justify-between text-xs text-white/60">
        <div class="h-4 w-36 rounded bg-white/10 animate-pulse"></div>
        <div class="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
      </div>
      <div class="flex items-center justify-between text-xs text-white/60">
        <div class="h-4 w-36 rounded bg-white/10 animate-pulse"></div>
        <div class="h-4 w-24 rounded bg-white/10 animate-pulse"></div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div>
        <div class="text-2xl font-semibold tabular-nums">{{ pct.toFixed(1) }}%</div>
        <div class="text-xs text-white/60">of stable-quoted volume</div>
      </div>

      <div
        class="h-3 rounded bg-white/10 overflow-hidden flex"
        :aria-label="`BTC ${pct.toFixed(1)}% · Others ${otherPct.toFixed(1)}%`"
        role="img"
        title="BTC vs Others (24h stable-quoted volume)"
      >
        <div
          class="h-full"
          :style="{
            width: pct + '%',
            backgroundColor: colors.btc,
            borderTopLeftRadius: '6px',
            borderBottomLeftRadius: '6px',
          }"
          aria-label="BTC share"
        />
        <div
          class="h-full"
          :style="{
            width: otherPct + '%',
            backgroundColor: colors.others,
            borderTopRightRadius: '6px',
            borderBottomRightRadius: '6px',
          }"
          aria-label="Others share"
        />
      </div>

      <!-- Legend -->
      <ul class="text-xs text-white/80 space-y-1.5">
        <li class="flex items-center justify-between">
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded" :style="{ backgroundColor: colors.btc }"></span>
            BTC (stable quotes)
          </span>
          <span class="tabular-nums">
            ${{ btcVolFmt }}
            <span class="text-white/50">· {{ pct.toFixed(1) }}%</span>
          </span>
        </li>
        <li class="flex items-center justify-between text-white/80">
          <span class="inline-flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded" :style="{ backgroundColor: colors.others }"></span>
            Others
          </span>
          <span class="tabular-nums">
            ${{ othersVolFmt }}
            <span class="text-white/50">· {{ otherPct.toFixed(1) }}%</span>
          </span>
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

const btcVol = computed(() =>
  rows.value.reduce((acc, r: any) => {
    const base = sym2Base.value[r.symbol]
    const quote = sym2Quote.value[r.symbol]
    if (base === 'BTC' && stable.has(quote)) acc += Number(r.quoteVolume || 0)
    return acc
  }, 0),
)

const totalStable = computed(() =>
  rows.value.reduce((acc, r: any) => {
    const quote = sym2Quote.value[r.symbol]
    if (stable.has(quote)) acc += Number(r.quoteVolume || 0)
    return acc
  }, 0),
)

const pct = computed(() => {
  const t = totalStable.value || 1
  return (btcVol.value / t) * 100
})
const otherPct = computed(() => Math.max(0, 100 - pct.value))

const btcVolFmt = computed(() => Math.round(btcVol.value).toLocaleString())
const othersVolFmt = computed(() =>
  Math.round(Math.max(0, totalStable.value - btcVol.value)).toLocaleString(),
)

const colors = {
  btc: '#f59e0b',
  others: '#3b82f6',
}
</script>
