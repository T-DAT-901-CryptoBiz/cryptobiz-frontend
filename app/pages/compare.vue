<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">Compare Cryptocurrencies</h2>
      <button
        v-if="selectedSymbols.length > 0"
        class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
        @click="clearSelection"
      >
        Clear All
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="(slot, index) in 3"
        :key="index"
        class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4"
      >
        <div class="mb-4">
          <label class="block text-sm text-white/70 mb-2">Crypto {{ index + 1 }}</label>
          <div class="relative">
            <input
              v-model="searchQueries[index]"
              type="text"
              placeholder="Search symbol (e.g., BTCUSDT)"
              class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
              @input="handleSearch(index, $event)"
            />
            <div
              v-if="searchResults[index] && searchResults[index].length > 0"
              class="absolute z-10 w-full mt-1 bg-neutral-800 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            >
              <button
                v-for="symbol in searchResults[index]"
                :key="symbol"
                class="w-full px-4 py-2 text-left hover:bg-white/10 text-sm"
                @click="selectSymbol(index, symbol)"
              >
                {{ symbol }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="selectedSymbols[index]" class="space-y-4">
          <div class="flex items-center gap-3">
            <ui-coin-logo :asset="getBaseAsset(selectedSymbols[index])" :size="32" />
            <div>
              <div class="font-semibold">{{ getBaseAsset(selectedSymbols[index]) }}</div>
              <div class="text-sm text-white/60">{{ selectedSymbols[index] }}</div>
            </div>
          </div>

          <div v-if="comparisonData[index]" class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-white/70">Price</span>
              <span class="font-semibold">${{ formatPrice(comparisonData[index].price) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-white/70">24h Change</span>
              <span
                :class="comparisonData[index].change24h >= 0 ? 'text-green-400' : 'text-red-400'"
              >
                {{ comparisonData[index].change24h >= 0 ? '+' : ''
                }}{{ comparisonData[index].change24h.toFixed(2) }}%
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-white/70">24h Volume</span>
              <span class="text-sm">${{ formatVolume(comparisonData[index].volume24h) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-white/70">Market Cap</span>
              <span class="text-sm">${{ formatVolume(comparisonData[index].marketCap) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="selectedSymbols.filter(Boolean).length > 1"
      class="rounded-2xl bg-neutral-900/60 border border-white/5 p-6"
    >
      <h3 class="text-lg font-semibold mb-4">Price Comparison Chart</h3>
      <div class="h-96">
        <ClientOnly>
          <apexchart type="line" height="100%" :options="chartOptions" :series="chartSeries" />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTicker } from '~/composables/useTicker'
import { useKlines } from '~/composables/useKlines'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'

definePageMeta({
  title: 'Compare',
})

const searchQueries = ref(['', '', ''])
const searchResults = ref<string[][]>([[], [], []])
const selectedSymbols = ref<(string | null)[]>([null, null, null])
const comparisonData = ref<
  Array<{
    price: number
    change24h: number
    volume24h: number
    marketCap: number
  } | null>
>([null, null, null])

const { universe } = useSymbolsUniverse()

function handleSearch(index: number, event: Event) {
  const query = (event.target as HTMLInputElement).value.toUpperCase()
  if (query.length < 2) {
    searchResults.value[index] = []
    return
  }
  searchResults.value[index] = universe.value.filter((s) => s.includes(query)).slice(0, 10)
}

function selectSymbol(index: number, symbol: string) {
  selectedSymbols.value[index] = symbol
  searchQueries.value[index] = symbol
  searchResults.value[index] = []
  loadComparisonData(index, symbol)
}

function clearSelection() {
  selectedSymbols.value = [null, null, null]
  searchQueries.value = ['', '', '']
  comparisonData.value = [null, null, null]
}

function getBaseAsset(symbol: string | null): string {
  if (!symbol) return ''
  const match = symbol.match(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/)
  const quote = match?.[0] ?? ''
  return symbol.slice(0, symbol.length - quote.length)
}

function formatPrice(price: number): string {
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}

function formatVolume(volume: number): string {
  if (volume >= 1e12) return (volume / 1e12).toFixed(2) + 'T'
  if (volume >= 1e9) return (volume / 1e9).toFixed(2) + 'B'
  if (volume >= 1e6) return (volume / 1e6).toFixed(2) + 'M'
  if (volume >= 1e3) return (volume / 1e3).toFixed(2) + 'K'
  return volume.toFixed(2)
}

async function loadComparisonData(index: number, symbol: string) {
  try {
    const { data: ticker } = useTicker(symbol)
    await ticker.value

    if (ticker.value) {
      comparisonData.value[index] = {
        price: Number(ticker.value.lastPrice || 0),
        change24h: Number(ticker.value.priceChangePercent || 0),
        volume24h: Number(ticker.value.quoteVolume || 0),
        marketCap: Number(ticker.value.lastPrice || 0) * Number(ticker.value.volume || 0), // Approximation
      }
    }
  } catch (error) {
    console.error('Error loading comparison data:', error)
  }
}

const chartData = ref<Record<string, Array<[number, number]>>>({})

const chartSeries = computed(() => {
  const series: Array<{ name: string; data: Array<[number, number]> }> = []

  selectedSymbols.value.forEach((symbol) => {
    if (symbol && chartData.value[symbol]) {
      series.push({
        name: symbol,
        data: chartData.value[symbol],
      })
    }
  })

  return series
})

watch(
  selectedSymbols,
  async (symbols) => {
    for (const symbol of symbols) {
      if (symbol && !chartData.value[symbol]) {
        const { candles, refresh } = useKlines(symbol, '1h', 24)
        await refresh()
        if (candles.value && candles.value.length > 0) {
          chartData.value[symbol] = candles.value.map((c) => [c.time * 1000, c.close])
        }
      }
    }
  },
  { immediate: true },
)

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: '100%',
    background: 'transparent',
    toolbar: { show: false },
  },
  theme: { mode: 'dark' as const },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: {
    type: 'datetime' as const,
    labels: { style: { colors: '#9CA3AF' } },
  },
  yaxis: {
    labels: { style: { colors: '#9CA3AF' } },
  },
  legend: {
    labels: { colors: '#D1D5DB' },
  },
  grid: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
}))
</script>
