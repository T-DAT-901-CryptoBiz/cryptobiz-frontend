<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Compare Cryptocurrencies</h1>
        <p class="text-sm text-white/60 mt-1">Compare up to 5 cryptocurrencies side by side</p>
      </div>
      <button
        v-if="selectedSymbols.length > 0"
        @click="clearAll"
        class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition-colors"
      >
        <Icon name="lucide:x" class="h-4 w-4 inline mr-2" />
        Clear All
      </button>
    </div>

    <!-- Symbol Selector -->
    <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-semibold text-white/80">Select Assets</h2>
        <span class="text-xs text-white/60">{{ selectedSymbols.length }}/5 selected</span>
      </div>

      <!-- Search Input -->
      <div class="relative mb-3">
        <Icon
          name="lucide:search"
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by symbol or name (e.g., BTC, Bitcoin)"
          class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
          @input="onSearchInput"
          @focus="showSuggestions = true"
        />
        <div
          v-if="showSuggestions && filteredSuggestions.length > 0"
          class="absolute z-10 w-full mt-1 bg-neutral-900 border border-white/10 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          <button
            v-for="suggestion in filteredSuggestions"
            :key="suggestion.symbol"
            @click="addSymbol(suggestion.symbol)"
            class="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
          >
            <div class="flex items-center gap-3">
              <ui-coin-logo :asset="suggestion.base" :size="24" />
              <div>
                <div class="text-sm font-medium">{{ suggestion.base }}</div>
                <div class="text-xs text-white/60">{{ suggestion.symbol }}</div>
              </div>
            </div>
            <span v-if="selectedSymbols.includes(suggestion.symbol)" class="text-xs text-white/40">
              Added
            </span>
          </button>
        </div>
      </div>

      <!-- Selected Symbols -->
      <div v-if="selectedSymbols.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="symbol in selectedSymbols"
          :key="symbol"
          class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/20"
        >
          <ui-coin-logo :asset="getBase(symbol)" :size="20" />
          <span class="text-sm font-medium">{{ symbol.replace('USDC', '') }}</span>
          <button
            @click="removeSymbol(symbol)"
            class="text-white/60 hover:text-white transition-colors"
            aria-label="Remove"
          >
            <Icon name="lucide:x" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Asset Cards Grid -->
    <div
      v-if="selectedSymbols.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="symbol in selectedSymbols"
        :key="symbol"
        class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
      >
        <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <ui-coin-logo :asset="getBase(symbol)" :size="24" />
            <div>
              <h3 class="font-semibold">{{ getBase(symbol) }}</h3>
              <p class="text-xs text-white/60">{{ symbol }}</p>
            </div>
          </div>
          <NuxtLink
            :to="`/asset/${symbol}`"
            class="text-xs text-white/60 hover:text-white/90 transition-colors"
          >
            <Icon name="lucide:external-link" class="h-4 w-4" />
          </NuxtLink>
        </div>

        <div class="p-4 space-y-4">
          <!-- Price -->
          <div>
            <div class="text-xs text-white/60 mb-1">Price</div>
            <div class="text-2xl font-semibold tabular-nums">
              <span v-if="comparisonData[symbol]">
                ${{ formatPrice(comparisonData[symbol].price) }}
              </span>
              <span v-else class="inline-block h-6 w-32 rounded bg-white/10 animate-pulse" />
            </div>
            <div
              v-if="comparisonData[symbol]"
              class="text-sm mt-1 tabular-nums inline-flex items-center gap-1"
              :class="comparisonData[symbol].change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'"
            >
              <Icon
                :name="
                  comparisonData[symbol].change24h >= 0
                    ? 'lucide:trending-up'
                    : 'lucide:trending-down'
                "
                class="h-4 w-4"
              />
              {{ formatChange(comparisonData[symbol].change24h) }}
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-xl border border-white/10 p-2.5 bg-white/5">
              <div class="text-xs text-white/60 mb-0.5">24h High</div>
              <div class="text-sm font-semibold tabular-nums">
                <span v-if="comparisonData[symbol]">
                  ${{ formatPrice(comparisonData[symbol].high24h) }}
                </span>
                <span v-else class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
            <div class="rounded-xl border border-white/10 p-2.5 bg-white/5">
              <div class="text-xs text-white/60 mb-0.5">24h Low</div>
              <div class="text-sm font-semibold tabular-nums">
                <span v-if="comparisonData[symbol]">
                  ${{ formatPrice(comparisonData[symbol].low24h) }}
                </span>
                <span v-else class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
            <div class="rounded-xl border border-white/10 p-2.5 bg-white/5">
              <div class="text-xs text-white/60 mb-0.5">24h Volume</div>
              <div class="text-sm font-semibold tabular-nums">
                <span v-if="comparisonData[symbol]">
                  {{ formatVolume(comparisonData[symbol].volume24h) }}
                </span>
                <span v-else class="inline-block h-4 w-20 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
            <div class="rounded-xl border border-white/10 p-2.5 bg-white/5">
              <div class="text-xs text-white/60 mb-0.5">Range</div>
              <div class="text-sm font-semibold tabular-nums">
                <span v-if="comparisonData[symbol]">
                  {{ formatRange(comparisonData[symbol].high24h, comparisonData[symbol].low24h) }}%
                </span>
                <span v-else class="inline-block h-4 w-16 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparison Chart -->
    <div
      v-if="selectedSymbols.length > 0"
      class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
    >
      <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 class="font-semibold">Price Comparison</h3>
        <div class="flex items-center gap-2">
          <button
            v-for="interval in intervals"
            :key="interval"
            @click="selectedInterval = interval"
            class="px-3 py-1 rounded-lg text-xs transition-colors"
            :class="
              selectedInterval === interval
                ? 'bg-white/10 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            "
          >
            {{ interval }}
          </button>
        </div>
      </div>
      <div class="p-4">
        <ClientOnly>
          <div v-if="chartLoading" class="h-80 flex items-center justify-center">
            <div class="text-center">
              <div
                class="inline-block h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2"
              />
              <div class="text-sm text-white/60">Loading chart data...</div>
            </div>
          </div>
          <apexchart
            v-else-if="
              chartSeries.length > 0 && chartSeries.some((s) => s.data && s.data.length > 0)
            "
            type="line"
            height="400"
            :options="chartOptions"
            :series="chartSeries"
          />
          <div
            v-else-if="!chartLoading"
            class="h-80 flex items-center justify-center text-white/60"
          >
            No chart data available
          </div>
          <template #fallback>
            <div class="h-80 flex items-center justify-center text-white/60">Loading chart...</div>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Comparison Table -->
    <div
      v-if="selectedSymbols.length > 0"
      class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden"
    >
      <div class="px-4 py-3 border-b border-white/5">
        <h3 class="font-semibold">Detailed Comparison</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="text-white/60 border-b border-white/10">
            <tr>
              <th class="px-4 py-3 text-left">Metric</th>
              <th v-for="symbol in selectedSymbols" :key="symbol" class="px-4 py-3 text-left">
                <div class="flex items-center gap-2">
                  <ui-coin-logo :asset="getBase(symbol)" :size="18" />
                  {{ getBase(symbol) }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metric in metrics" :key="metric.key" class="border-b border-white/5">
              <td class="px-4 py-3 text-white/70 font-medium">{{ metric.label }}</td>
              <td v-for="symbol in selectedSymbols" :key="symbol" class="px-4 py-3">
                <template v-if="comparisonData[symbol]">
                  <span
                    v-if="metric.key === 'change24h'"
                    :class="
                      comparisonData[symbol][metric.key] >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    "
                    class="tabular-nums font-medium inline-flex items-center gap-1"
                  >
                    <Icon
                      :name="
                        comparisonData[symbol][metric.key] >= 0
                          ? 'lucide:trending-up'
                          : 'lucide:trending-down'
                      "
                      class="h-4 w-4"
                    />
                    {{ formatMetric(comparisonData[symbol][metric.key], metric.key) }}
                  </span>
                  <span v-else class="tabular-nums text-white/90">
                    {{ formatMetric(comparisonData[symbol][metric.key], metric.key) }}
                  </span>
                </template>
                <span v-else class="text-white/40">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="selectedSymbols.length === 0"
      class="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center"
    >
      <div class="mx-auto h-16 w-16 grid place-items-center rounded-full bg-white/5 mb-4">
        <Icon name="lucide:git-compare" class="h-8 w-8 text-white/70" />
      </div>
      <p class="text-white/80 font-medium mb-1 text-lg">No assets selected</p>
      <p class="text-sm text-white/60">Search and add cryptocurrencies above to start comparing</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import { mapKlines } from '~/composables/useKlines'
import type { Interval } from '~/types/binance'

useHead({
  title: 'Compare Cryptocurrencies',
})

const { rows } = useAll24h()
const { maps } = useSymbolsUniverse()
const { klines } = useBinanceMarket()

const selectedSymbols = ref<string[]>([])
const searchQuery = ref('')
const showSuggestions = ref(false)
const selectedInterval = ref<Interval>('1h')
const intervals: Interval[] = ['30m', '1h']

const chartLoading = ref(false)
const chartData = ref<Record<string, Array<{ time: number; value: number }>>>({})

// Get available symbols for suggestions
const availableSymbols = computed(() => {
  const symbols: Array<{ symbol: string; base: string; name: string }> = []
  const seen = new Set<string>()

  for (const ticker of rows.value) {
    if (!ticker.symbol || !ticker.symbol.endsWith('USDC')) continue
    if (seen.has(ticker.symbol)) continue
    seen.add(ticker.symbol)

    const base = maps.value.base[ticker.symbol] || ticker.symbol.replace('USDC', '')
    symbols.push({
      symbol: ticker.symbol,
      base,
      name: base,
    })
  }

  return symbols.sort((a, b) => a.base.localeCompare(b.base))
})

const filteredSuggestions = computed(() => {
  if (!searchQuery.value.trim()) {
    return availableSymbols.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return availableSymbols.value.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query) ||
      s.base.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query),
  )
})

function onSearchInput() {
  showSuggestions.value = true
}

function getBase(symbol: string): string {
  return maps.value.base[symbol] || symbol.replace('USDC', '')
}

async function addSymbol(symbol: string) {
  if (selectedSymbols.value.includes(symbol)) return
  if (selectedSymbols.value.length >= 5) return
  selectedSymbols.value.push(symbol)
  searchQuery.value = ''
  showSuggestions.value = false

  // Load chart data immediately for the new symbol
  await loadChartDataForSymbol(symbol)
}

function removeSymbol(symbol: string) {
  const index = selectedSymbols.value.indexOf(symbol)
  if (index > -1) {
    selectedSymbols.value.splice(index, 1)
    delete chartData.value[symbol]
  }
}

function clearAll() {
  selectedSymbols.value = []
  chartData.value = {}
}

const metrics = [
  { key: 'price', label: 'Price (USDC)' },
  { key: 'change24h', label: '24h Change (%)' },
  { key: 'volume24h', label: '24h Volume (USDC)' },
  { key: 'high24h', label: '24h High' },
  { key: 'low24h', label: '24h Low' },
]

const comparisonData = computed(() => {
  const data: Record<string, Record<string, number>> = {}
  for (const symbol of selectedSymbols.value) {
    const ticker = rows.value.find((r) => r.symbol === symbol)
    if (ticker) {
      data[symbol] = {
        price: Number(ticker.lastPrice ?? 0),
        change24h: Number(ticker.priceChangePercent ?? 0),
        volume24h: Number(ticker.quoteVolume ?? 0),
        high24h: Number(ticker.highPrice ?? 0),
        low24h: Number(ticker.lowPrice ?? 0),
      }
    }
  }
  return data
})

// Chart data loading with API (periodic refresh)
const loadingSymbols = ref<Set<string>>(new Set())
let refreshTimer: ReturnType<typeof setInterval> | null = null

async function loadChartDataForSymbol(symbol: string) {
  if (loadingSymbols.value.has(symbol)) return
  loadingSymbols.value.add(symbol)

  try {
    const r = await klines(symbol, selectedInterval.value, 100)
    await r.refresh?.()
    const raw = (r.data.value ?? []) as Array<[number, string, string, string, string, string]>

    if (raw && raw.length > 0) {
      const candles = mapKlines(raw)
      chartData.value[symbol] = candles.map((c) => ({
        time: c.time * 1000, // Convert to milliseconds
        value: c.close,
      }))
    }
  } catch (error) {
    console.error(`Error loading chart data for ${symbol}:`, error)
  } finally {
    loadingSymbols.value.delete(symbol)
    updateChartLoading()
  }
}

function updateChartLoading() {
  if (selectedSymbols.value.length === 0) {
    chartLoading.value = false
    return
  }

  // Check if all symbols are loaded
  const allLoaded = selectedSymbols.value.every(
    (symbol) => !loadingSymbols.value.has(symbol) && chartData.value[symbol]?.length > 0,
  )

  chartLoading.value = !allLoaded
}

async function loadAllChartData() {
  if (selectedSymbols.value.length === 0) {
    chartLoading.value = false
    chartData.value = {}
    return
  }

  chartLoading.value = true
  // Don't clear existing data, only load missing symbols
  const symbolsToLoad = selectedSymbols.value.filter(
    (symbol) => !chartData.value[symbol] || chartData.value[symbol].length === 0,
  )

  if (symbolsToLoad.length === 0) {
    chartLoading.value = false
    return
  }

  // Load data for missing symbols in parallel
  await Promise.all(symbolsToLoad.map((symbol) => loadChartDataForSymbol(symbol)))
}

watch(
  [selectedSymbols, selectedInterval],
  async () => {
    await loadAllChartData()
  },
  { immediate: true },
)

// Periodic refresh every 60 seconds
onMounted(() => {
  refreshTimer = setInterval(() => {
    if (selectedSymbols.value.length > 0) {
      loadAllChartData()
    }
  }, 60000) // Refresh every 60 seconds
})

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})

const chartSeries = computed(() => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  return selectedSymbols.value
    .filter((symbol) => chartData.value[symbol] && chartData.value[symbol].length > 0)
    .map((symbol) => {
      const data = chartData.value[symbol] || []
      const index = selectedSymbols.value.indexOf(symbol)
      return {
        name: getBase(symbol),
        data: data.map((d) => ({
          x: new Date(d.time),
          y: d.value,
        })),
        color: colors[index % colors.length],
      }
    })
})

const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    height: 400,
    background: 'transparent',
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
  },
  theme: {
    mode: 'dark',
  },
  stroke: {
    width: 2,
    curve: 'smooth',
  },
  xaxis: {
    type: 'datetime',
    labels: {
      style: {
        colors: '#ffffff80',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#ffffff80',
      },
      formatter: (val: number) => '$' + val.toFixed(2),
    },
  },
  legend: {
    labels: {
      colors: '#ffffff80',
    },
  },
  grid: {
    borderColor: '#ffffff10',
  },
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val: number) => '$' + val.toFixed(2),
    },
  },
}))

function formatPrice(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 8, minimumFractionDigits: 2 })
}

function formatChange(value: number): string {
  return (value >= 0 ? '+' : '') + value.toFixed(2) + '%'
}

function formatVolume(value: number): string {
  if (value >= 1e9) return '$' + (value / 1e9).toFixed(2) + 'B'
  if (value >= 1e6) return '$' + (value / 1e6).toFixed(2) + 'M'
  if (value >= 1e3) return '$' + (value / 1e3).toFixed(2) + 'K'
  return '$' + value.toFixed(2)
}

function formatRange(high: number, low: number): string {
  if (low === 0) return '0.00'
  return (((high - low) / low) * 100).toFixed(2)
}

function formatMetric(value: number, key: string): string {
  if (key === 'price') {
    return '$' + value.toLocaleString(undefined, { maximumFractionDigits: 8 })
  }
  if (key === 'change24h') {
    return (value >= 0 ? '+' : '') + value.toFixed(2) + '%'
  }
  if (key === 'volume24h') {
    return formatVolume(value)
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

// Close suggestions when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showSuggestions.value = false
    }
  })
})
</script>
