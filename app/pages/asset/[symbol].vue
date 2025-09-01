<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <NuxtLink to="/markets" class="text-sm px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20"
          >← Markets
        </NuxtLink>
        <h1 class="text-2xl font-semibold">{{ symbol }}</h1>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold tabular-nums">
          <span v-if="!pending">${{ Number(t?.lastPrice || 0).toLocaleString() }}</span>
          <span v-else>—</span>
        </div>
        <div
          class="text-sm"
          :class="Number(t?.priceChangePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'"
        >
          {{ Number(t?.priceChangePercent || 0).toFixed(2) }}% (24h)
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        class="lg:col-span-2 rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
      >
        <div class="p-3 border-b border-white/5 flex items-center gap-3">
          <label class="text-sm text-white/60">Interval</label>
          <select
            v-model="interval"
            class="rounded-xl bg-neutral-900/70 border border-white/10 px-3 py-1.5 text-sm"
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="30m">30m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
        </div>
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
        <MarketAssetOverview :symbol="symbol" />
        <MarketBidAsk :symbol="symbol" :height="160" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <MarketPerformanceChips class="lg:col-span-2" :symbol="symbol" />
      <MarketVolumeSplit :symbol="symbol" :window="400" />
    </div>

    <div class="grid grid-cols-1 2xl:grid-cols-3 gap-6">
      <div class="2xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <MarketOrderBook :symbol="symbol" :limit="50" :height="320" />
        <MarketDepthChart :symbol="symbol" :limit="50" :height="320" />
      </div>
      <div class="grid grid-cols-1 gap-6">
        <MarketRecentTrades :symbol="symbol" :limit="120" :height="320" />
        <MarketWhaleTrades :symbol="symbol" />
      </div>
    </div>

    <MarketPairsForBase :base="base" />
  </div>
</template>

<script setup lang="ts">
import type { Interval } from '~/types/binance'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTicker } from '~/composables/useTicker'

const route = useRoute()
const symbol = computed(() => String(route.params.symbol || 'BTCUSDT'))
const base = computed(() => symbol.value.replace(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/, ''))
const tvSymbol = computed(() => `BINANCE:${symbol.value}`)
const interval = ref<Interval>('1h')
const { data: t, pending } = useTicker(symbol.value)
</script>
