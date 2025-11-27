<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold">Price Alerts</h1>
        <p class="text-sm text-white/60 mt-1.5">
          Get notified when your favorite cryptocurrencies reach target prices
        </p>
      </div>
      <button
        @click="showAddModal = true"
        class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium transition-colors inline-flex items-center gap-2"
      >
        <Icon name="lucide:plus" class="h-4 w-4" />
        Create Alert
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="pending && alerts.length === 0" class="text-center py-12">
      <div
        class="inline-block h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2"
      />
      <div class="text-sm text-white/60">Loading alerts...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
      <div class="flex items-center gap-2 text-red-400">
        <Icon name="lucide:alert-circle" class="h-5 w-5" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Alerts Content -->
    <div v-else class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-5 hover:border-white/20 transition-all shadow-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-medium text-white/60 uppercase tracking-wider">
              Active Alerts
            </div>
            <Icon name="lucide:bell" class="h-5 w-5 text-white/30" />
          </div>
          <div class="text-3xl font-bold tabular-nums">{{ activeAlerts.length }}</div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-5 hover:border-white/20 transition-all shadow-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-medium text-white/60 uppercase tracking-wider">Triggered</div>
            <Icon name="lucide:check-circle" class="h-5 w-5 text-white/30" />
          </div>
          <div class="text-3xl font-bold tabular-nums">{{ triggeredAlerts.length }}</div>
        </div>

        <div
          class="rounded-2xl bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 border border-white/10 p-5 hover:border-white/20 transition-all shadow-lg"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="text-xs font-medium text-white/60 uppercase tracking-wider">Total</div>
            <Icon name="lucide:list" class="h-5 w-5 text-white/30" />
          </div>
          <div class="text-3xl font-bold tabular-nums">{{ alerts.length }}</div>
        </div>
      </div>

      <!-- Active Alerts -->
      <div
        v-if="activeAlerts.length > 0"
        class="rounded-2xl bg-neutral-900/60 border border-white/10 overflow-hidden shadow-lg"
      >
        <div
          class="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5"
        >
          <h3 class="font-semibold text-lg">Active Alerts</h3>
          <span class="text-xs text-white/60 bg-white/5 px-2.5 py-1 rounded-full">
            {{ activeAlerts.length }} {{ activeAlerts.length === 1 ? 'alert' : 'alerts' }}
          </span>
        </div>

        <div class="divide-y divide-white/5">
          <div
            v-for="alert in activeAlerts"
            :key="alert.id"
            class="p-5 hover:bg-white/5 transition-colors group"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-4 flex-1">
                <ui-coin-logo :asset="getBase(alert.symbol)" :size="40" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-semibold text-lg">{{ getBase(alert.symbol) }}</h4>
                    <span class="text-xs text-white/50">{{ alert.symbol }}</span>
                  </div>
                  <div class="flex items-center gap-4 flex-wrap">
                    <div class="flex items-center gap-2">
                      <Icon
                        :name="
                          alert.type === 'above'
                            ? 'lucide:arrow-up'
                            : alert.type === 'below'
                              ? 'lucide:arrow-down'
                              : 'lucide:trending-up'
                        "
                        class="h-4 w-4 text-white/60"
                      />
                      <span class="text-sm text-white/70">
                        {{
                          alert.type === 'above'
                            ? `Alert when price ≥ $${formatPrice(alert.targetPrice!)}`
                            : alert.type === 'below'
                              ? `Alert when price ≤ $${formatPrice(alert.targetPrice!)}`
                              : `Alert when ${alert.changePercent! > 0 ? '+' : ''}${alert.changePercent}% change`
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="text-xs text-white/50 mt-2">
                    Created {{ formatDate(alert.createdAt) }}
                  </div>
                </div>
              </div>
              <div
                class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  @click="editAlert(alert)"
                  class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Edit"
                >
                  <Icon name="lucide:edit" class="h-4 w-4" />
                </button>
                <button
                  @click="toggleAlertStatus(alert.id)"
                  class="p-2 rounded-lg text-white/60 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                  aria-label="Disable"
                >
                  <Icon name="lucide:bell-off" class="h-4 w-4" />
                </button>
                <button
                  @click="deleteAlert(alert)"
                  class="p-2 rounded-lg text-white/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  aria-label="Delete"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Triggered Alerts -->
      <div
        v-if="triggeredAlerts.length > 0"
        class="rounded-2xl bg-neutral-900/60 border border-white/10 overflow-hidden shadow-lg"
      >
        <div
          class="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5"
        >
          <h3 class="font-semibold text-lg">Triggered Alerts</h3>
          <span class="text-xs text-white/60 bg-white/5 px-2.5 py-1 rounded-full">
            {{ triggeredAlerts.length }} {{ triggeredAlerts.length === 1 ? 'alert' : 'alerts' }}
          </span>
        </div>

        <div class="divide-y divide-white/5">
          <div
            v-for="alert in triggeredAlerts"
            :key="alert.id"
            class="p-5 hover:bg-white/5 transition-colors group bg-emerald-500/5"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-4 flex-1">
                <ui-coin-logo :asset="getBase(alert.symbol)" :size="40" />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <h4 class="font-semibold text-lg">{{ getBase(alert.symbol) }}</h4>
                    <span class="text-xs text-white/50">{{ alert.symbol }}</span>
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    >
                      <Icon name="lucide:check-circle" class="h-3 w-3" />
                      Triggered
                    </span>
                  </div>
                  <div class="flex items-center gap-4 flex-wrap">
                    <div class="flex items-center gap-2">
                      <Icon
                        :name="
                          alert.type === 'above'
                            ? 'lucide:arrow-up'
                            : alert.type === 'below'
                              ? 'lucide:arrow-down'
                              : 'lucide:trending-up'
                        "
                        class="h-4 w-4 text-white/60"
                      />
                      <span class="text-sm text-white/70">
                        {{
                          alert.type === 'above'
                            ? `Alerted at ≥ $${formatPrice(alert.targetPrice!)}`
                            : alert.type === 'below'
                              ? `Alerted at ≤ $${formatPrice(alert.targetPrice!)}`
                              : `Alerted at ${alert.changePercent! > 0 ? '+' : ''}${alert.changePercent}% change`
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="text-xs text-white/50 mt-2">
                    Triggered {{ alert.triggeredAt ? formatDate(alert.triggeredAt) : 'Recently' }}
                  </div>
                </div>
              </div>
              <div
                class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  @click="resetAlertStatus(alert.id)"
                  class="p-2 rounded-lg text-white/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  aria-label="Reset"
                  title="Reactivate alert"
                >
                  <Icon name="lucide:refresh-cw" class="h-4 w-4" />
                </button>
                <button
                  @click="deleteAlert(alert)"
                  class="p-2 rounded-lg text-white/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  aria-label="Delete"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="alerts.length === 0"
        class="rounded-2xl bg-neutral-900/60 border border-white/10 p-12 text-center"
      >
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
          <Icon name="lucide:bell" class="h-8 w-8 text-white/40" />
        </div>
        <p class="text-white/80 font-medium mb-1">No alerts yet</p>
        <p class="text-sm text-white/50 mb-4">
          Create price alerts to get notified when cryptocurrencies reach your target prices
        </p>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-sm transition-colors inline-flex items-center gap-2"
        >
          <Icon name="lucide:plus" class="h-4 w-4" />
          Create First Alert
        </button>
      </div>
    </div>

    <!-- Add/Edit Alert Modal -->
    <div
      v-if="showAddModal || editingAlert"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="closeModal"
    >
      <div
        class="bg-neutral-900 border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold">
              {{ editingAlert ? 'Edit Alert' : 'Create Price Alert' }}
            </h3>
            <p class="text-xs text-white/50 mt-1">
              {{
                editingAlert ? 'Update alert settings' : 'Get notified when price reaches target'
              }}
            </p>
          </div>
          <button
            @click="closeModal"
            class="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </div>

        <form @submit.prevent="saveAlert" class="space-y-5">
          <div>
            <label class="block text-xs font-medium text-white/70 mb-2">Symbol</label>
            <div class="relative symbol-input-container">
              <Icon
                name="lucide:search"
                class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
              />
              <input
                v-model="form.symbol"
                type="text"
                placeholder="Search symbol (e.g., BTCUSDC)"
                required
                class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                @input="onSymbolInput"
                @focus="showSymbolSuggestions = true"
              />
              <div
                v-if="showSymbolSuggestions && symbolSuggestions.length > 0"
                class="absolute z-20 w-full mt-1 bg-neutral-800 border border-white/10 rounded-xl shadow-xl max-h-96 overflow-y-auto"
              >
                <button
                  v-for="suggestion in symbolSuggestions"
                  :key="suggestion.symbol"
                  type="button"
                  @click="selectSymbol(suggestion.symbol)"
                  class="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                >
                  <ui-coin-logo :asset="suggestion.base" :size="24" />
                  <div class="flex-1">
                    <div class="text-sm font-medium">{{ suggestion.base }}</div>
                    <div class="text-xs text-white/50">{{ suggestion.symbol }}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-white/70 mb-2">Alert Type</label>
            <div class="grid grid-cols-3 gap-3">
              <button
                type="button"
                @click="form.type = 'above'"
                class="px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                :class="
                  form.type === 'above'
                    ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 text-white/70 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                "
              >
                <Icon name="lucide:arrow-up" class="h-4 w-4 inline mr-2" />
                Above
              </button>
              <button
                type="button"
                @click="form.type = 'below'"
                class="px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                :class="
                  form.type === 'below'
                    ? 'bg-rose-500/20 text-rose-400 border-2 border-rose-500/40 shadow-lg shadow-rose-500/10'
                    : 'bg-white/5 text-white/70 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                "
              >
                <Icon name="lucide:arrow-down" class="h-4 w-4 inline mr-2" />
                Below
              </button>
              <button
                type="button"
                @click="form.type = 'change'"
                class="px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                :class="
                  form.type === 'change'
                    ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
                    : 'bg-white/5 text-white/70 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                "
              >
                <Icon name="lucide:trending-up" class="h-4 w-4 inline mr-2" />
                Change
              </button>
            </div>
          </div>

          <div v-if="form.type === 'above' || form.type === 'below'">
            <label class="block text-xs font-medium text-white/70 mb-2">Target Price (USDC)</label>
            <div class="relative">
              <input
                v-model.number="form.targetPrice"
                type="number"
                step="any"
                placeholder="0.00"
                required
                min="0"
                class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              <div
                v-if="currentPrice"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50"
              >
                Current: ${{
                  currentPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })
                }}
              </div>
            </div>
          </div>

          <div v-if="form.type === 'change'">
            <label class="block text-xs font-medium text-white/70 mb-2">Change Percent (%)</label>
            <div class="relative">
              <input
                v-model.number="form.changePercent"
                type="number"
                step="any"
                placeholder="5.00"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
              <div
                v-if="currentChangePercent !== null"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50"
              >
                Current: {{ currentChangePercent >= 0 ? '+' : ''
                }}{{ currentChangePercent.toFixed(2) }}%
              </div>
            </div>
            <p class="text-xs text-white/50 mt-1">
              Alert when price changes by this percentage (positive or negative)
            </p>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="pending"
              class="flex-1 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {{ editingAlert ? 'Update Alert' : 'Create Alert' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal && alertToDelete"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="cancelDelete"
    >
      <div
        class="bg-neutral-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div
          class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10"
        >
          <Icon name="lucide:alert-triangle" class="h-8 w-8 text-rose-400" />
        </div>

        <h3 class="text-xl font-bold text-center mb-2">Delete Alert</h3>
        <p class="text-sm text-white/60 text-center mb-6">
          Are you sure you want to delete this alert? This action cannot be undone.
        </p>

        <div class="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div class="flex items-center gap-3 mb-3">
            <ui-coin-logo :asset="getBase(alertToDelete.symbol)" :size="32" />
            <div class="flex-1">
              <div class="font-semibold">{{ getBase(alertToDelete.symbol) }}</div>
              <div class="text-xs text-white/50">{{ alertToDelete.symbol }}</div>
            </div>
          </div>
          <div class="text-sm text-white/70">
            {{
              alertToDelete.type === 'above'
                ? `Alert when price ≥ $${formatPrice(alertToDelete.targetPrice!)}`
                : alertToDelete.type === 'below'
                  ? `Alert when price ≤ $${formatPrice(alertToDelete.targetPrice!)}`
                  : `Alert when ${alertToDelete.changePercent! > 0 ? '+' : ''}${alertToDelete.changePercent}% change`
            }}
          </div>
        </div>

        <div class="flex gap-3">
          <button
            type="button"
            @click="cancelDelete"
            class="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="confirmDelete"
            :disabled="pending"
            class="flex-1 px-4 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-sm font-semibold transition-colors disabled:opacity-50 text-rose-400"
          >
            <Icon name="lucide:trash-2" class="h-4 w-4 inline mr-2" />
            Delete Alert
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { usePriceAlerts } from '~/composables/usePriceAlerts'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import { useAll24h } from '~/composables/useAll24h'
import type { PriceAlert } from '~/server/utils/alerts'

useHead({
  title: 'Price Alerts - CryptoBiz',
})

const { isAuthenticated, pending: authPending } = useAuth()
const {
  alerts,
  activeAlerts,
  triggeredAlerts,
  pending,
  error,
  load,
  createAlert,
  updateAlert,
  removeAlert,
  toggleAlert: toggleAlertStatus,
  resetAlert: resetAlertStatus,
} = usePriceAlerts()
const { maps } = useSymbolsUniverse()
const { rows } = useAll24h()

const showAddModal = ref(false)
const editingAlert = ref<PriceAlert | null>(null)
const showDeleteModal = ref(false)
const alertToDelete = ref<PriceAlert | null>(null)
const showSymbolSuggestions = ref(false)
const symbolSuggestions = ref<Array<{ symbol: string; base: string }>>([])

const availableSymbols = computed(() => {
  const symbols: Array<{ symbol: string; base: string }> = []
  for (const [symbol, base] of Object.entries(maps.value.base)) {
    if (symbol.endsWith('USDC')) {
      symbols.push({ symbol, base })
    }
  }
  return symbols.sort((a, b) => a.base.localeCompare(b.base))
})

const form = ref({
  symbol: '',
  type: 'above' as 'above' | 'below' | 'change',
  targetPrice: undefined as number | undefined,
  changePercent: undefined as number | undefined,
})

const currentPrice = computed(() => {
  if (!form.value.symbol) return null
  const ticker = rows.value.find((r) => r.symbol === form.value.symbol)
  return ticker ? Number(ticker.lastPrice || 0) : null
})

const currentChangePercent = computed(() => {
  if (!form.value.symbol) return null
  const ticker = rows.value.find((r) => r.symbol === form.value.symbol)
  return ticker ? Number(ticker.priceChangePercent || 0) : null
})

function onSymbolInput() {
  const query = form.value.symbol.toUpperCase().trim()
  if (query.length === 0) {
    symbolSuggestions.value = availableSymbols.value
    return
  }
  const cleanQuery = query.replace(/USDC$/, '')
  symbolSuggestions.value = availableSymbols.value.filter(
    (s) =>
      s.symbol.toUpperCase().includes(query) ||
      s.base.toUpperCase().includes(cleanQuery) ||
      s.symbol.toUpperCase().startsWith(cleanQuery),
  )
}

function selectSymbol(symbol: string) {
  form.value.symbol = symbol
  showSymbolSuggestions.value = false
}

function getBase(symbol: string): string {
  return maps.value.base[symbol] || symbol.replace('USDC', '').replace('USDT', '')
}

function formatPrice(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

// Block body scroll when modal is open
watch([showAddModal, showDeleteModal], ([showModal, showDelete]) => {
  if (showModal || showDelete) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(async () => {
  // Close suggestions when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.symbol-input-container')) {
      showSymbolSuggestions.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)

  // Écouter les événements de déclenchement d'alerte pour recharger la liste
  const handleAlertTriggered = (event: Event) => {
    const customEvent = event as CustomEvent
    console.log(
      '[Alerts] Alert triggered event received:',
      customEvent.detail,
      'reloading alerts...',
    )
    // Attendre un peu pour s'assurer que le serveur a bien mis à jour
    setTimeout(() => {
      load()
    }, 500)
  }
  if (import.meta.client) {
    window.addEventListener('alert-triggered', handleAlertTriggered)
  }

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('alert-triggered', handleAlertTriggered)
    document.body.style.overflow = ''
  })

  // Wait for authentication
  if (authPending.value) {
    await new Promise((resolve) => {
      const unwatch = watch(authPending, (pending) => {
        if (!pending) {
          unwatch()
          resolve(undefined)
        }
      })
    })
  }

  if (isAuthenticated.value) {
    await load()
  }
})

function closeModal() {
  showAddModal.value = false
  editingAlert.value = null
  showSymbolSuggestions.value = false
  document.body.style.overflow = ''
  form.value = {
    symbol: '',
    type: 'above',
    targetPrice: undefined,
    changePercent: undefined,
  }
}

function editAlert(alert: PriceAlert) {
  editingAlert.value = alert
  form.value = {
    symbol: alert.symbol,
    type: alert.type,
    targetPrice: alert.targetPrice,
    changePercent: alert.changePercent,
  }
  showAddModal.value = true
}

async function saveAlert() {
  try {
    if (editingAlert.value) {
      await updateAlert(editingAlert.value.id, form.value)
    } else {
      await createAlert(form.value)
    }
    closeModal()
    // Recharger les alertes après création
    await load()
    // Forcer une vérification immédiate des alertes
    if (import.meta.client) {
      console.log('[Alerts] Forcing immediate check after alert creation')
      // Essayer plusieurs méthodes pour appeler la fonction
      setTimeout(() => {
        const checkAlertsFn = (window as { __checkAlerts?: () => void }).__checkAlerts
        if (checkAlertsFn && typeof checkAlertsFn === 'function') {
          checkAlertsFn()
        } else {
          // Si la fonction n'est pas encore disponible, réessayer
          console.log('[Alerts] __checkAlerts not available yet, retrying...')
          setTimeout(() => {
            const checkAlertsFnRetry = (window as { __checkAlerts?: () => void }).__checkAlerts
            if (checkAlertsFnRetry && typeof checkAlertsFnRetry === 'function') {
              checkAlertsFnRetry()
            } else {
              console.warn(
                '[Alerts] Could not trigger immediate check, will check in next interval',
              )
            }
          }, 1000)
        }
      }, 500)
    }
  } catch (e) {
    console.error('Error saving alert:', e)
  }
}

function deleteAlert(alert: PriceAlert) {
  alertToDelete.value = alert
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!alertToDelete.value) return

  try {
    await removeAlert(alertToDelete.value.id)
    showDeleteModal.value = false
    alertToDelete.value = null
    document.body.style.overflow = ''
  } catch (e) {
    console.error('Error deleting alert:', e)
  }
}

function cancelDelete() {
  showDeleteModal.value = false
  alertToDelete.value = null
  document.body.style.overflow = ''
}
</script>
