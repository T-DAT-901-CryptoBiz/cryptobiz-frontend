<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">Advanced Screener</h2>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
          @click="savePreset"
        >
          Save Preset
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
          @click="resetFilters"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-1 space-y-4">
        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
          <h3 class="font-semibold mb-4">Filters</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-white/70 mb-2">Min Market Cap</label>
              <input
                v-model.number="filters.minMarketCap"
                type="number"
                placeholder="0"
                class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label class="block text-sm text-white/70 mb-2">Max Market Cap</label>
              <input
                v-model.number="filters.maxMarketCap"
                type="number"
                placeholder="∞"
                class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label class="block text-sm text-white/70 mb-2">Min 24h Volume</label>
              <input
                v-model.number="filters.minVolume"
                type="number"
                placeholder="0"
                class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label class="block text-sm text-white/70 mb-2">Min 24h Change %</label>
              <input
                v-model.number="filters.minChange24h"
                type="number"
                step="0.1"
                placeholder="-100"
                class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label class="block text-sm text-white/70 mb-2">Max 24h Change %</label>
              <input
                v-model.number="filters.maxChange24h"
                type="number"
                step="0.1"
                placeholder="100"
                class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
          <h3 class="font-semibold mb-4">Saved Presets</h3>
          <div class="space-y-2">
            <button
              v-for="preset in savedPresets"
              :key="preset.id"
              class="w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-left"
              @click="loadPreset(preset)"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="lg:col-span-3">
        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
          <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <div class="text-sm text-white/70">Results: {{ filteredSymbols.length }}</div>
            <div class="flex gap-2">
              <button
                class="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs"
                @click="exportToCSV"
              >
                Export CSV
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="text-white/60 border-b border-white/10">
                <tr>
                  <th class="px-4 py-3 text-left">Symbol</th>
                  <th class="px-4 py-3 text-right">Price</th>
                  <th class="px-4 py-3 text-right">24h Change</th>
                  <th class="px-4 py-3 text-right">24h Volume</th>
                  <th class="px-4 py-3 text-right">Market Cap</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="symbol in filteredSymbols.slice(0, 100)"
                  :key="symbol"
                  class="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                  @click="$router.push(`/asset/${symbol}`)"
                >
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <ui-coin-logo :asset="getBaseAsset(symbol)" :size="20" />
                      <span class="font-medium">{{ getBaseAsset(symbol) }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums">
                    ${{ formatPrice(screenerData[symbol]?.price || 0) }}
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums">
                    <span
                      :class="
                        (screenerData[symbol]?.change24h || 0) >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      "
                    >
                      {{ (screenerData[symbol]?.change24h || 0) >= 0 ? '+' : ''
                      }}{{ (screenerData[symbol]?.change24h || 0).toFixed(2) }}%
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums">
                    ${{ formatVolume(screenerData[symbol]?.volume24h || 0) }}
                  </td>
                  <td class="px-4 py-3 text-right tabular-nums">
                    ${{ formatVolume(screenerData[symbol]?.marketCap || 0) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAll24h } from '~/composables/useAll24h'

definePageMeta({
  title: 'Screener',
})

interface Filters {
  minMarketCap: number | null
  maxMarketCap: number | null
  minVolume: number | null
  minChange24h: number | null
  maxChange24h: number | null
}

interface Preset {
  id: string
  name: string
  filters: Filters
}

const filters = ref<Filters>({
  minMarketCap: null,
  maxMarketCap: null,
  minVolume: null,
  minChange24h: null,
  maxChange24h: null,
})

const savedPresets = ref<Preset[]>([])
const screenerData = ref<
  Record<string, { price: number; change24h: number; volume24h: number; marketCap: number }>
>({})
const { rows } = useAll24h()

const filteredSymbols = computed(() => {
  return Object.keys(screenerData.value).filter((symbol) => {
    const data = screenerData.value[symbol]
    if (!data) return false

    if (filters.value.minMarketCap !== null && data.marketCap < filters.value.minMarketCap) {
      return false
    }
    if (filters.value.maxMarketCap !== null && data.marketCap > filters.value.maxMarketCap) {
      return false
    }
    if (filters.value.minVolume !== null && data.volume24h < filters.value.minVolume) {
      return false
    }
    if (filters.value.minChange24h !== null && data.change24h < filters.value.minChange24h) {
      return false
    }
    if (filters.value.maxChange24h !== null && data.change24h > filters.value.maxChange24h) {
      return false
    }

    return true
  })
})

function getBaseAsset(symbol: string): string {
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

function resetFilters() {
  filters.value = {
    minMarketCap: null,
    maxMarketCap: null,
    minVolume: null,
    minChange24h: null,
    maxChange24h: null,
  }
}

async function savePreset() {
  const name = prompt('Preset name:')
  if (!name) return
  try {
    const preset = await $fetch('/api/screener', {
      method: 'POST',
      body: {
        name,
        filters: { ...filters.value },
      },
    })
    savedPresets.value.push(preset)
  } catch (error) {
    console.error('Error saving preset:', error)
  }
}

function loadPreset(preset: Preset) {
  filters.value = { ...preset.filters }
}

async function loadPresets() {
  try {
    const data = await $fetch<Preset[]>('/api/screener')
    savedPresets.value = data
  } catch (error) {
    console.error('Error loading presets:', error)
  }
}

function exportToCSV() {
  const headers = ['Symbol', 'Price', '24h Change %', '24h Volume', 'Market Cap']
  const rows = filteredSymbols.value.map((symbol) => {
    const data = screenerData.value[symbol]
    return [
      symbol,
      data?.price || 0,
      data?.change24h || 0,
      data?.volume24h || 0,
      data?.marketCap || 0,
    ]
  })

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `screener_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

watch(
  rows,
  () => {
    for (const ticker of rows.value) {
      screenerData.value[ticker.symbol] = {
        price: Number(ticker.lastPrice || 0),
        change24h: Number(ticker.priceChangePercent || 0),
        volume24h: Number(ticker.quoteVolume || 0),
        marketCap: Number(ticker.lastPrice || 0) * Number(ticker.volume || 0), // Approximation
      }
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await loadPresets()
})
</script>
