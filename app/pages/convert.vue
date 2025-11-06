<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">Crypto Converter</h1>
        <p class="text-sm text-white/60 mt-1.5">
          Convert between cryptocurrencies with real-time exchange rates
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
      <!-- Main Converter Card -->
      <div class="lg:col-span-2 flex h-full">
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl w-full flex flex-col h-full"
        >
          <!-- From Section -->
          <div class="space-y-4 mb-6">
            <label class="block text-xs font-semibold text-white/70 uppercase tracking-wider"
              >From</label
            >

            <!-- Symbol Selector -->
            <div class="relative">
              <div class="flex items-center gap-3">
                <div class="flex-1 relative symbol-input-container">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Icon name="lucide:search" class="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    v-model="fromSymbolSearch"
                    type="text"
                    placeholder="Search crypto..."
                    class="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    @input="onFromSymbolInput"
                    @focus="showFromSuggestions = true"
                  />
                  <div
                    v-if="
                      showFromSuggestions &&
                      (fromSuggestions.length > 0 || fromSymbolSearch.length > 0)
                    "
                    class="absolute z-30 w-full mt-2 bg-neutral-800/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto"
                  >
                    <button
                      v-for="suggestion in fromSuggestions"
                      :key="suggestion.symbol"
                      type="button"
                      @click="selectFromSymbol(suggestion.symbol)"
                      class="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                    >
                      <ui-coin-logo :asset="suggestion.base" :size="28" />
                      <div class="flex-1">
                        <div class="text-sm font-semibold">{{ suggestion.base }}</div>
                        <div class="text-xs text-white/50">{{ suggestion.symbol }}</div>
                      </div>
                      <div v-if="getPriceInUSDC(suggestion.symbol)" class="text-xs text-white/60">
                        ${{ formatCurrency(getPriceInUSDC(suggestion.symbol)!) }}
                      </div>
                    </button>
                  </div>
                </div>
                <div
                  v-if="fromSymbol"
                  class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/10 border border-white/20 min-w-[120px]"
                >
                  <ui-coin-logo :asset="getBase(fromSymbol)" :size="28" />
                  <span class="text-sm font-semibold">{{ getBase(fromSymbol) }}</span>
                </div>
              </div>
            </div>

            <!-- Amount Input -->
            <div class="relative">
              <input
                v-model.number="fromAmount"
                type="number"
                step="any"
                placeholder="0.00"
                min="0"
                class="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-2xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all tabular-nums"
                @input="onFromAmountChange"
              />
              <div
                v-if="fromPrice && fromAmount"
                class="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-white/50 tabular-nums pointer-events-none"
              >
                ≈ ${{ formatCurrency(fromPrice * fromAmount) }}
              </div>
            </div>
          </div>

          <!-- Swap Button -->
          <div class="flex justify-center my-4">
            <button
              @click="swapCurrencies"
              class="group relative flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
              aria-label="Swap currencies"
            >
              <Icon
                name="lucide:arrow-up-down"
                class="h-5 w-5 text-white/60 group-hover:text-white transition-colors"
              />
            </button>
          </div>

          <!-- To Section -->
          <div class="space-y-4">
            <label class="block text-xs font-semibold text-white/70 uppercase tracking-wider"
              >To</label
            >

            <!-- Symbol Selector -->
            <div class="relative">
              <div class="flex items-center gap-3">
                <div class="flex-1 relative symbol-input-container">
                  <div class="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Icon name="lucide:search" class="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    v-model="toSymbolSearch"
                    type="text"
                    placeholder="Search crypto..."
                    class="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    @input="onToSymbolInput"
                    @focus="showToSuggestions = true"
                  />
                  <div
                    v-if="
                      showToSuggestions && (toSuggestions.length > 0 || toSymbolSearch.length > 0)
                    "
                    class="absolute z-30 w-full mt-2 bg-neutral-800/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl max-h-80 overflow-y-auto"
                  >
                    <button
                      v-for="suggestion in toSuggestions"
                      :key="suggestion.symbol"
                      type="button"
                      @click="selectToSymbol(suggestion.symbol)"
                      class="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                    >
                      <ui-coin-logo :asset="suggestion.base" :size="28" />
                      <div class="flex-1">
                        <div class="text-sm font-semibold">{{ suggestion.base }}</div>
                        <div class="text-xs text-white/50">{{ suggestion.symbol }}</div>
                      </div>
                      <div v-if="getPriceInUSDC(suggestion.symbol)" class="text-xs text-white/60">
                        ${{ formatCurrency(getPriceInUSDC(suggestion.symbol)!) }}
                      </div>
                    </button>
                  </div>
                </div>
                <div
                  v-if="toSymbol"
                  class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/10 border border-white/20 min-w-[120px]"
                >
                  <ui-coin-logo :asset="getBase(toSymbol)" :size="28" />
                  <span class="text-sm font-semibold">{{ getBase(toSymbol) }}</span>
                </div>
              </div>
            </div>

            <!-- Amount Output -->
            <div class="relative">
              <input
                :value="toAmount"
                type="text"
                placeholder="0.00"
                readonly
                class="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-2xl font-bold text-white placeholder:text-white/20 focus:outline-none tabular-nums"
              />
              <div
                v-if="toPrice && toAmount"
                class="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-white/50 tabular-nums pointer-events-none"
              >
                ≈ ${{ formatCurrency(toPrice * toAmount) }}
              </div>
            </div>
          </div>

          <!-- Exchange Rate & Info -->
          <div
            v-if="conversionRate && fromSymbol && toSymbol"
            class="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="lucide:info" class="h-4 w-4 text-white/60" />
                <span class="text-xs font-medium text-white/70">Exchange Rate</span>
              </div>
              <span class="text-sm font-bold tabular-nums">
                1 {{ getBase(fromSymbol) }} = {{ formatNumber(conversionRate) }}
                {{ getBase(toSymbol) }}
              </span>
            </div>
          </div>

          <!-- Convert Button -->
          <button
            @click="performConversion"
            :disabled="!canConvert"
            class="w-full mt-6 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Convert
          </button>
        </div>
      </div>

      <!-- History Sidebar -->
      <div class="flex h-full">
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-6 shadow-2xl w-full flex flex-col h-full"
        >
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
              <Icon name="lucide:history" class="h-5 w-5 text-white/60" />
              <h2 class="text-lg font-semibold">Recent Conversions</h2>
            </div>
            <button
              v-if="history.length > 0"
              @click="clearHistory"
              class="text-xs text-white/60 hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-rose-500/10"
            >
              Clear
            </button>
          </div>

          <div v-if="history.length === 0" class="text-center py-12">
            <div
              class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4"
            >
              <Icon name="lucide:history" class="h-8 w-8 text-white/30" />
            </div>
            <p class="text-sm text-white/60">No conversions yet</p>
            <p class="text-xs text-white/40 mt-1">Your conversion history will appear here</p>
          </div>

          <div v-else class="space-y-3 max-h-[600px] overflow-y-auto">
            <div
              v-for="conv in history"
              :key="conv.id"
              class="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              @click="loadConversion(conv)"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <ui-coin-logo :asset="getBase(conv.fromSymbol)" :size="24" />
                  <span class="text-sm font-semibold">{{ getBase(conv.fromSymbol) }}</span>
                  <Icon name="lucide:arrow-right" class="h-3.5 w-3.5 text-white/40" />
                  <ui-coin-logo :asset="getBase(conv.toSymbol)" :size="24" />
                  <span class="text-sm font-semibold">{{ getBase(conv.toSymbol) }}</span>
                </div>
                <button
                  @click.stop="removeFromHistory(conv.id)"
                  class="opacity-0 group-hover:opacity-100 text-white/40 hover:text-rose-400 transition-all p-1 rounded-lg hover:bg-rose-500/10"
                >
                  <Icon name="lucide:x" class="h-4 w-4" />
                </button>
              </div>
              <div class="text-sm font-bold tabular-nums mb-1">
                {{ formatNumber(conv.amount) }} {{ getBase(conv.fromSymbol) }} =
                {{ formatNumber(conv.result) }} {{ getBase(conv.toSymbol) }}
              </div>
              <div class="flex items-center justify-between">
                <div class="text-xs text-white/50">
                  {{ formatDate(conv.timestamp) }}
                </div>
                <div class="text-xs text-white/60 tabular-nums">
                  1 {{ getBase(conv.fromSymbol) }} = {{ formatNumber(conv.rate) }}
                  {{ getBase(conv.toSymbol) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useCryptoConverter } from '~/composables/useCryptoConverter'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import type { ConversionHistory } from '~/composables/useCryptoConverter'

useHead({
  title: 'Crypto Converter',
})

const {
  convert,
  addToHistory,
  loadHistory,
  clearHistory,
  history,
  availableSymbols,
  getPriceInUSDC,
} = useCryptoConverter()
const { maps } = useSymbolsUniverse()

const fromSymbol = ref('BTCUSDC')
const toSymbol = ref('ETHUSDC')
const fromSymbolSearch = ref('')
const toSymbolSearch = ref('')
const fromAmount = ref<number>(1)
const toAmount = ref<number>(0)
const showFromSuggestions = ref(false)
const showToSuggestions = ref(false)
const fromSuggestions = ref<Array<{ symbol: string; base: string }>>([])
const toSuggestions = ref<Array<{ symbol: string; base: string }>>([])

const fromPrice = computed(() => getPriceInUSDC(fromSymbol.value))
const toPrice = computed(() => getPriceInUSDC(toSymbol.value))

const conversionResult = computed(() => {
  if (!fromSymbol.value || !toSymbol.value || !fromAmount.value || fromAmount.value <= 0) {
    return null
  }
  return convert(fromSymbol.value, toSymbol.value, fromAmount.value)
})

const conversionRate = computed(() => {
  if (!fromSymbol.value || !toSymbol.value) return null
  const result = convert(fromSymbol.value, toSymbol.value, 1)
  return result ? result.rate : null
})

const canConvert = computed(() => {
  return (
    fromSymbol.value &&
    toSymbol.value &&
    fromAmount.value &&
    fromAmount.value > 0 &&
    fromSymbol.value !== toSymbol.value &&
    conversionResult.value !== null
  )
})

watch(conversionResult, (result) => {
  if (result) {
    toAmount.value = result.result
  } else {
    toAmount.value = 0
  }
})

function getBase(symbol: string): string {
  return maps.value.base[symbol] || symbol.replace('USDC', '').replace('USDT', '')
}

function onFromSymbolInput() {
  const query = fromSymbolSearch.value.toUpperCase().trim()
  if (query.length === 0) {
    fromSuggestions.value = availableSymbols.value
    return
  }
  const cleanQuery = query.replace(/USDC$/, '')
  fromSuggestions.value = availableSymbols.value.filter(
    (s) =>
      s.symbol.toUpperCase().includes(query) ||
      s.base.toUpperCase().includes(cleanQuery) ||
      s.base.toUpperCase().includes(query) ||
      s.symbol.toUpperCase().includes(cleanQuery),
  )
}

function onToSymbolInput() {
  const query = toSymbolSearch.value.toUpperCase().trim()
  if (query.length === 0) {
    toSuggestions.value = availableSymbols.value
    return
  }
  const cleanQuery = query.replace(/USDC$/, '')
  toSuggestions.value = availableSymbols.value.filter(
    (s) =>
      s.symbol.toUpperCase().includes(query) ||
      s.base.toUpperCase().includes(cleanQuery) ||
      s.base.toUpperCase().includes(query) ||
      s.symbol.toUpperCase().includes(cleanQuery),
  )
}

function selectFromSymbol(symbol: string) {
  fromSymbol.value = symbol
  fromSymbolSearch.value = ''
  showFromSuggestions.value = false
  updateConversion()
}

function selectToSymbol(symbol: string) {
  toSymbol.value = symbol
  toSymbolSearch.value = ''
  showToSuggestions.value = false
  updateConversion()
}

function swapCurrencies() {
  const temp = fromSymbol.value
  fromSymbol.value = toSymbol.value
  toSymbol.value = temp
  updateConversion()
}

function onFromAmountChange() {
  updateConversion()
}

function updateConversion() {
  if (conversionResult.value) {
    toAmount.value = conversionResult.value.result
  }
}

function performConversion() {
  if (!canConvert.value || !conversionResult.value) return

  const result = conversionResult.value
  addToHistory(fromSymbol.value, toSymbol.value, fromAmount.value, result.result, result.rate)
}

function loadConversion(conv: ConversionHistory) {
  fromSymbol.value = conv.fromSymbol
  toSymbol.value = conv.toSymbol
  fromAmount.value = conv.amount
  toAmount.value = conv.result
}

function removeFromHistory(id: string) {
  const index = history.value.findIndex((h) => h.id === id)
  if (index !== -1) {
    history.value.splice(index, 1)
    if (typeof window !== 'undefined') {
      localStorage.setItem('conversionHistory', JSON.stringify(history.value))
    }
  }
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatNumber(value: number): string {
  if (value >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 8 })
  }
  return value.toFixed(8).replace(/\.?0+$/, '')
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(() => {
  loadHistory()
  updateConversion()

  // Initialize suggestions
  fromSuggestions.value = availableSymbols.value
  toSuggestions.value = availableSymbols.value

  // Close suggestions when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.symbol-input-container')) {
      showFromSuggestions.value = false
      showToSuggestions.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>
