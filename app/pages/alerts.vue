<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">Price Alerts</h2>
      <button
        class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
        @click="showAddModal = true"
      >
        Create Alert
      </button>
    </div>

    <div
      v-if="alerts.length === 0"
      class="rounded-2xl bg-neutral-900/60 border border-white/5 p-12 text-center"
    >
      <Icon name="lucide:bell" class="h-12 w-12 mx-auto mb-4 text-white/40" />
      <p class="text-white/80 font-medium mb-2">No alerts yet</p>
      <p class="text-sm text-white/60 mb-4">Get notified when prices reach your target</p>
      <button
        class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
        @click="showAddModal = true"
      >
        Create Your First Alert
      </button>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <ui-coin-logo :asset="getBaseAsset(alert.symbol)" :size="32" />
            <div>
              <div class="font-semibold">{{ getBaseAsset(alert.symbol) }}</div>
              <div class="text-sm text-white/60">
                Alert when price
                <span class="font-medium">{{ alert.condition === 'above' ? '≥' : '≤' }}</span>
                ${{ formatPrice(alert.targetPrice) }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span
              :class="
                alert.triggered
                  ? 'px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs'
                  : 'px-3 py-1 rounded-full bg-white/10 text-white/60 text-xs'
              "
            >
              {{ alert.triggered ? 'Triggered' : 'Active' }}
            </span>
            <button
              class="px-3 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs"
              @click="deleteAlert(alert.id)"
            >
              Delete
            </button>
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-white/10 text-sm text-white/60">
          Current: ${{ formatPrice(currentPrices[alert.symbol] || 0) }}
        </div>
      </div>
    </div>

    <!-- Add Alert Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      @click.self="showAddModal = false"
    >
      <div class="bg-neutral-900 rounded-2xl border border-white/10 p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Create Price Alert</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-white/70 mb-2">Symbol</label>
            <input
              v-model="newAlert.symbol"
              type="text"
              placeholder="BTCUSDT"
              class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
          <div>
            <label class="block text-sm text-white/70 mb-2">Condition</label>
            <select
              v-model="newAlert.condition"
              class="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              <option value="above">Price goes above</option>
              <option value="below">Price goes below</option>
            </select>
          </div>
          <div>
            <label class="block text-sm text-white/70 mb-2">Target Price</label>
            <input
              v-model.number="newAlert.targetPrice"
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
              @click="addAlert"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTicker } from '~/composables/useTicker'

definePageMeta({
  title: 'Alerts',
})

interface Alert {
  id: string
  symbol: string
  condition: 'above' | 'below'
  targetPrice: number
  triggered: boolean
  createdAt: number
}

const alerts = ref<Alert[]>([])
const showAddModal = ref(false)
const newAlert = ref({
  symbol: '',
  condition: 'above' as 'above' | 'below',
  targetPrice: 0,
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

function addAlert() {
  if (!newAlert.value.symbol || newAlert.value.targetPrice <= 0) {
    return
  }
  alerts.value.push({
    id: Date.now().toString(),
    symbol: newAlert.value.symbol.toUpperCase(),
    condition: newAlert.value.condition,
    targetPrice: newAlert.value.targetPrice,
    triggered: false,
    createdAt: Date.now(),
  })
  saveAlerts()
  newAlert.value = { symbol: '', condition: 'above', targetPrice: 0 }
  showAddModal.value = false
}

function deleteAlert(id: string) {
  alerts.value = alerts.value.filter((a) => a.id !== id)
  saveAlerts()
}

function saveAlerts() {
  if (import.meta.client) {
    localStorage.setItem('price_alerts', JSON.stringify(alerts.value))
  }
}

function loadAlerts() {
  if (import.meta.client) {
    const saved = localStorage.getItem('price_alerts')
    if (saved) {
      alerts.value = JSON.parse(saved)
    }
  }
}

async function checkAlerts() {
  for (const alert of alerts.value) {
    if (alert.triggered) continue

    try {
      const { data: ticker } = useTicker(alert.symbol)
      await ticker.value
      if (ticker.value) {
        const currentPrice = Number(ticker.value.lastPrice || 0)
        currentPrices.value[alert.symbol] = currentPrice

        const shouldTrigger =
          (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
          (alert.condition === 'below' && currentPrice <= alert.targetPrice)

        if (shouldTrigger) {
          alert.triggered = true
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Alert: ${alert.symbol}`, {
              body: `Price ${alert.condition === 'above' ? 'reached' : 'dropped to'} $${alert.targetPrice}`,
              icon: '/cryptobiz-logo.png',
            })
          }
          saveAlerts()
        }
      }
    } catch (error) {
      console.error(`Error checking alert for ${alert.symbol}:`, error)
    }
  }
}

onMounted(() => {
  loadAlerts()
  checkAlerts()
  setInterval(checkAlerts, 10000) // Check every 10 seconds

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})
</script>
