<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">Portfolio Tracker</h2>
      <button
        class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
        @click="showAddModal = true"
      >
        Add Position
      </button>
    </div>

    <div
      v-if="positions.length === 0"
      class="rounded-2xl bg-neutral-900/60 border border-white/5 p-12 text-center"
    >
      <Icon name="lucide:wallet" class="h-12 w-12 mx-auto mb-4 text-white/40" />
      <p class="text-white/80 font-medium mb-2">No positions yet</p>
      <p class="text-sm text-white/60 mb-4">Start tracking your crypto investments</p>
      <button
        class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
        @click="showAddModal = true"
      >
        Add Your First Position
      </button>
    </div>

    <div v-else class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
          <div class="text-sm text-white/70 mb-1">Total Value</div>
          <div class="text-2xl font-semibold">${{ formatPrice(totalValue) }}</div>
        </div>
        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
          <div class="text-sm text-white/70 mb-1">Total P&L</div>
          <div
            :class="totalPnL >= 0 ? 'text-green-400' : 'text-red-400'"
            class="text-2xl font-semibold"
          >
            {{ totalPnL >= 0 ? '+' : '' }}${{ formatPrice(Math.abs(totalPnL)) }}
          </div>
        </div>
        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
          <div class="text-sm text-white/70 mb-1">Total P&L %</div>
          <div
            :class="totalPnLPercent >= 0 ? 'text-green-400' : 'text-red-400'"
            class="text-2xl font-semibold"
          >
            {{ totalPnLPercent >= 0 ? '+' : '' }}{{ totalPnLPercent.toFixed(2) }}%
          </div>
        </div>
        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
          <div class="text-sm text-white/70 mb-1">Positions</div>
          <div class="text-2xl font-semibold">{{ positions.length }}</div>
        </div>
      </div>

      <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
        <table class="min-w-full text-sm">
          <thead class="text-white/60 border-b border-white/10">
            <tr>
              <th class="px-4 py-3 text-left">Asset</th>
              <th class="px-4 py-3 text-right">Quantity</th>
              <th class="px-4 py-3 text-right">Avg Price</th>
              <th class="px-4 py-3 text-right">Current Price</th>
              <th class="px-4 py-3 text-right">Value</th>
              <th class="px-4 py-3 text-right">P&L</th>
              <th class="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="position in positions"
              :key="position.id"
              class="border-b border-white/5 hover:bg-white/5"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <ui-coin-logo :asset="getBaseAsset(position.symbol)" :size="24" />
                  <span class="font-medium">{{ getBaseAsset(position.symbol) }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-right tabular-nums">{{ position.quantity }}</td>
              <td class="px-4 py-3 text-right tabular-nums">
                ${{ formatPrice(position.avgPrice) }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums">
                ${{ formatPrice(currentPrices[position.symbol] || 0) }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums">
                ${{ formatPrice((currentPrices[position.symbol] || 0) * position.quantity) }}
              </td>
              <td class="px-4 py-3 text-right tabular-nums">
                <span :class="getPositionPnL(position) >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ getPositionPnL(position) >= 0 ? '+' : '' }}${{
                    formatPrice(Math.abs(getPositionPnL(position)))
                  }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  class="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs"
                  @click="deletePosition(position.id)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-6">
        <h3 class="text-lg font-semibold mb-4">Portfolio Evolution</h3>
        <div class="h-64">
          <ClientOnly>
            <apexchart type="area" height="100%" :options="chartOptions" :series="chartSeries" />
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Add Position Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      @click.self="showAddModal = false"
    >
      <div class="bg-neutral-900 rounded-2xl border border-white/10 p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Add Position</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-white/70 mb-2">Symbol</label>
            <input
              v-model="newPosition.symbol"
              type="text"
              placeholder="BTCUSDT"
              class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <div>
            <label class="block text-sm text-white/70 mb-2">Quantity</label>
            <input
              v-model.number="newPosition.quantity"
              type="number"
              step="0.00000001"
              placeholder="0.0"
              class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <div>
            <label class="block text-sm text-white/70 mb-2">Average Price</label>
            <input
              v-model.number="newPosition.avgPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
              @click="showAddModal = false"
            >
              Cancel
            </button>
            <button
              class="flex-1 px-4 py-2 rounded-lg bg-white text-neutral-900 font-medium text-sm hover:bg-white/90"
              @click="addPosition"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTicker } from '~/composables/useTicker'

definePageMeta({
  title: 'Portfolio',
})

interface Position {
  id: string
  symbol: string
  quantity: number
  avgPrice: number
  createdAt: number
}

const positions = ref<Position[]>([])
const showAddModal = ref(false)
const newPosition = ref({
  symbol: '',
  quantity: 0,
  avgPrice: 0,
})
const currentPrices = ref<Record<string, number>>({})

function getBaseAsset(symbol: string): string {
  const match = symbol.match(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/)
  const quote = match?.[0] ?? ''
  return symbol.slice(0, symbol.length - quote.length)
}

function formatPrice(price: number): string {
  return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}

function getPositionPnL(position: Position): number {
  const currentPrice = currentPrices.value[position.symbol] || 0
  return (currentPrice - position.avgPrice) * position.quantity
}

const totalValue = computed(() => {
  return positions.value.reduce((sum, pos) => {
    const currentPrice = currentPrices.value[pos.symbol] || 0
    return sum + currentPrice * pos.quantity
  }, 0)
})

const totalPnL = computed(() => {
  return positions.value.reduce((sum, pos) => sum + getPositionPnL(pos), 0)
})

const totalPnLPercent = computed(() => {
  const totalCost = positions.value.reduce((sum, pos) => sum + pos.avgPrice * pos.quantity, 0)
  if (totalCost === 0) return 0
  return (totalPnL.value / totalCost) * 100
})

function addPosition() {
  if (
    !newPosition.value.symbol ||
    newPosition.value.quantity <= 0 ||
    newPosition.value.avgPrice <= 0
  ) {
    return
  }
  positions.value.push({
    id: Date.now().toString(),
    symbol: newPosition.value.symbol.toUpperCase(),
    quantity: newPosition.value.quantity,
    avgPrice: newPosition.value.avgPrice,
    createdAt: Date.now(),
  })
  savePositions()
  newPosition.value = { symbol: '', quantity: 0, avgPrice: 0 }
  showAddModal.value = false
}

function deletePosition(id: string) {
  positions.value = positions.value.filter((p) => p.id !== id)
  savePositions()
}

function savePositions() {
  if (import.meta.client) {
    localStorage.setItem('portfolio_positions', JSON.stringify(positions.value))
  }
}

function loadPositions() {
  if (import.meta.client) {
    const saved = localStorage.getItem('portfolio_positions')
    if (saved) {
      positions.value = JSON.parse(saved)
    }
  }
}

async function updatePrices() {
  for (const position of positions.value) {
    try {
      const { data: ticker } = useTicker(position.symbol)
      await ticker.value
      if (ticker.value) {
        currentPrices.value[position.symbol] = Number(ticker.value.lastPrice || 0)
      }
    } catch (error) {
      console.error(`Error loading price for ${position.symbol}:`, error)
    }
  }
}

const chartSeries = computed(() => {
  // Simplified - in real app, you'd track historical portfolio values
  return [
    {
      name: 'Portfolio Value',
      data: [totalValue.value],
    },
  ]
})

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: '100%',
    background: 'transparent',
    toolbar: { show: false },
  },
  theme: { mode: 'dark' as const },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
  xaxis: {
    type: 'datetime' as const,
    labels: { style: { colors: '#9CA3AF' } },
  },
  yaxis: {
    labels: { style: { colors: '#9CA3AF' }, prefix: '$' },
  },
  grid: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
}))

onMounted(() => {
  loadPositions()
  updatePrices()
  setInterval(updatePrices, 30000) // Update every 30 seconds
})

watch(
  positions,
  () => {
    updatePrices()
  },
  { deep: true },
)
</script>
