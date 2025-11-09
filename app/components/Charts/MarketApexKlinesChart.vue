<template>
  <div class="bg-neutral-900/60 border border-white/5 rounded-2xl overflow-hidden">
    <!-- Header avec contrôles -->
    <div class="flex flex-col gap-4 p-4 md:p-6 border-b border-white/5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div>
            <div class="text-lg font-semibold text-white">{{ baseSymbol }}</div>
            <div class="text-sm text-white/50 tabular-nums">
              <span v-if="!pending && displayed.length > 0">
                {{ formatPrice(displayed[displayed.length - 1]?.c || 0) }}
                <span class="ml-2" :class="lastChange >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ lastChange >= 0 ? '+' : '' }}{{ lastChangePercent.toFixed(2) }}%
                </span>
              </span>
              <span v-else class="inline-block w-32 h-4 bg-white/10 animate-pulse rounded"></span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="connected"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
          >
            <Icon name="lucide:radio" class="h-3.5 w-3.5 animate-pulse" /> Live
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/40 border border-white/10"
          >
            <Icon name="lucide:wifi-off" class="h-3.5 w-3.5" /> Offline
          </span>
        </div>
      </div>

      <!-- Contrôles d'intervalle et de plage -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Intervalles -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-white/50 font-medium">Interval:</span>
          <select
            v-model="interval"
            class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option v-for="it in intervals" :key="it" :value="it" class="bg-neutral-900">
              {{ it }}
            </option>
          </select>
        </div>

        <!-- Plages de temps -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-white/50 font-medium">Range:</span>
          <select
            v-model="selectedRange"
            class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option v-for="r in timeRanges" :key="r.value" :value="r.value" class="bg-neutral-900">
              {{ r.label }}
            </option>
          </select>
        </div>

        <!-- Indicateurs techniques -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs text-white/50 font-medium">Indicators:</span>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              @click="selectAllIndicators"
              class="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white/90 hover:bg-white/10 text-xs transition-colors"
              title="Select All"
            >
              All
            </button>
            <button
              @click="deselectAllIndicators"
              class="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white/90 hover:bg-white/10 text-xs transition-colors"
              title="Deselect All"
            >
              None
            </button>
            <div class="w-px h-4 bg-white/10"></div>
            <button
              @click="toggleIndicator('volume')"
              class="px-2.5 py-1.5 rounded-lg border text-xs transition-colors"
              :class="
                activeIndicators.volume
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white/90 hover:bg-white/10'
              "
              title="Volume"
            >
              <Icon name="lucide:bar-chart-3" class="h-3.5 w-3.5 inline-block mr-1" />
              Volume
            </button>
            <button
              @click="toggleIndicator('sma20')"
              class="px-2.5 py-1.5 rounded-lg border text-xs transition-colors"
              :class="
                activeIndicators.sma20
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white/90 hover:bg-white/10'
              "
              title="SMA 20"
            >
              MA20
            </button>
            <button
              @click="toggleIndicator('sma50')"
              class="px-2.5 py-1.5 rounded-lg border text-xs transition-colors"
              :class="
                activeIndicators.sma50
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white/90 hover:bg-white/10'
              "
              title="SMA 50"
            >
              MA50
            </button>
            <button
              @click="toggleIndicator('ema20')"
              class="px-2.5 py-1.5 rounded-lg border text-xs transition-colors"
              :class="
                activeIndicators.ema20
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white/90 hover:bg-white/10'
              "
              title="EMA 20"
            >
              EMA20
            </button>
            <button
              @click="toggleIndicator('rsi')"
              class="px-2.5 py-1.5 rounded-lg border text-xs transition-colors"
              :class="
                activeIndicators.rsi
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white/90 hover:bg-white/10'
              "
              title="RSI"
            >
              RSI
            </button>
          </div>
        </div>

        <!-- Statistiques rapides -->
        <div v-if="displayed.length > 0" class="flex items-center gap-4 ml-auto text-xs">
          <div class="text-white/50">
            <span class="text-white/30">H:</span>
            <span class="ml-1 text-emerald-400 font-medium tabular-nums">
              {{ formatPrice(high24h) }}
            </span>
          </div>
          <div class="text-white/50">
            <span class="text-white/30">L:</span>
            <span class="ml-1 text-rose-400 font-medium tabular-nums">
              {{ formatPrice(low24h) }}
            </span>
          </div>
          <div class="text-white/50">
            <span class="text-white/30">Vol:</span>
            <span class="ml-1 text-white/70 font-medium tabular-nums">
              {{ formatVolume(volume24h) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <ClientOnly>
      <div v-if="pending && displayed.length === 0" class="h-[500px] p-4">
        <div class="h-full rounded-lg bg-white/5 animate-pulse" />
      </div>

      <div
        v-else-if="!error && displayed.length === 0"
        class="h-[500px] grid place-items-center text-center p-6"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-center gap-2 text-white/70">
            <Icon name="lucide:info" class="h-5 w-5" />
            <span>No data available for this cryptocurrency at this time.</span>
          </div>
          <div class="flex items-center justify-center gap-3">
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 transition-colors"
              @click="refresh"
            >
              <Icon name="lucide:refresh-ccw" class="h-4 w-4" /> Refresh
            </button>
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-colors"
              @click="$emit('switch-chart', 'tv')"
            >
              <Icon name="lucide:line-chart" class="h-4 w-4" /> TradingView
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="h-[500px] grid place-items-center text-center p-6">
        <div class="space-y-4 text-red-400/90">
          <div class="flex items-center justify-center gap-2">
            <Icon name="lucide:alert-triangle" class="h-5 w-5" />
            <span class="font-medium">Unable to load the chart</span>
          </div>
          <div class="text-sm text-white/70 max-w-md">{{ error }}</div>
          <div class="flex items-center justify-center gap-3">
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/80 transition-colors"
              @click="refresh"
            >
              <Icon name="lucide:refresh-ccw" class="h-4 w-4" /> Try again
            </button>
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-white/10 hover:bg-white/20 transition-colors"
              @click="$emit('switch-chart', 'tv')"
            >
              <Icon name="lucide:line-chart" class="h-4 w-4" /> TradingView
            </button>
          </div>
        </div>
      </div>

      <div v-else ref="chartContainer" class="h-[500px] w-full relative" />

      <template #fallback>
        <div class="h-[500px] grid place-items-center">
          <div class="text-white/50">Loading chart…</div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts'
import type { CandlestickData, HistogramData, LineData, Time } from 'lightweight-charts'
import { computed, ref, watch, nextTick, onBeforeUnmount, onMounted } from 'vue'
import { useKlinesWebSocket } from '~/composables/useKlinesWebSocket'

// Types pour le chart
type ChartApi = ReturnType<typeof createChart>

// Types
type Interval =
  | '1s'
  | '1m'
  | '3m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '2h'
  | '4h'
  | '6h'
  | '8h'
  | '12h'
  | '1d'
  | '3d'
  | '1w'
  | '1M'

type TimeRange = '1d' | '7d' | '30d' | '90d' | '1y' | 'all'

// Props
const props = defineProps<{ symbol: string; interval?: Interval }>()

// Emits
defineEmits<{
  'switch-chart': [type: 'tv']
}>()

// Intervalles disponibles
const intervals: Interval[] = [
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '8h',
  '12h',
  '1d',
  '3d',
  '1w',
  '1M',
]

// Plages de temps
const timeRanges: Array<{ label: string; value: TimeRange; seconds: number }> = [
  { label: '1D', value: '1d', seconds: 24 * 60 * 60 },
  { label: '7D', value: '7d', seconds: 7 * 24 * 60 * 60 },
  { label: '30D', value: '30d', seconds: 30 * 24 * 60 * 60 },
  { label: '90D', value: '90d', seconds: 90 * 24 * 60 * 60 },
  { label: '1Y', value: '1y', seconds: 365 * 24 * 60 * 60 },
  { label: 'All', value: 'all', seconds: Infinity },
]

// État
const symbol = ref(props.symbol)
const interval = ref<Interval>(props.interval ?? '1h')
const selectedRange = ref<TimeRange>('7d')
const showVolume = ref(true)

// Indicateurs techniques
const activeIndicators = ref({
  volume: false,
  sma20: false,
  sma50: false,
  ema20: false,
  rsi: false,
})

const selectedIndicators = ref<string[]>([])

// Séries d'indicateurs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sma20Series: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sma50Series: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ema20Series: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rsiSeries: any = null

// Conversion intervalle en millisecondes
const intervalMs: Record<Interval, number> = {
  '1s': 1000,
  '1m': 60 * 1000,
  '3m': 3 * 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '2h': 2 * 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '8h': 8 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
  '3d': 3 * 24 * 60 * 60 * 1000,
  '1w': 7 * 24 * 60 * 60 * 1000,
  '1M': 30 * 24 * 60 * 60 * 1000,
}

// Calculer la fenêtre de temps
const WINDOW_SEC = computed(() => {
  const range = timeRanges.find((r) => r.value === selectedRange.value)
  return range?.seconds ?? 7 * 24 * 60 * 60
})
const WINDOW_MS = computed(() =>
  WINDOW_SEC.value === Infinity ? Infinity : WINDOW_SEC.value * 1000,
)

// Watchers pour props
watch(
  () => props.symbol,
  (s) => {
    symbol.value = s
  },
)
watch(
  () => props.interval,
  (i) => {
    if (i) interval.value = i
  },
)

// WebSocket
type Ohlcv = { t: number; o: number; h: number; l: number; c: number; v: number }

const rows = ref<Ohlcv[]>([])
const pending = ref(false)
const error = ref<unknown>(null)

// Calculer le nombre de klines nécessaires
const neededKlines = computed(() => {
  if (WINDOW_MS.value === Infinity) return 1000
  const intervalMsValue = intervalMs[interval.value]
  return Math.min(1000, Math.ceil(WINDOW_MS.value / intervalMsValue) + 50)
})

const limitRef = ref(neededKlines.value)

watch(
  neededKlines,
  (newLimit) => {
    limitRef.value = newLimit
  },
  { immediate: true },
)

const enabled = ref(true)
const {
  data: wsData,
  connected,
  pending: wsPending,
  error: wsError,
  refresh: refreshWS,
  disconnect: disconnectWS,
  setLimit,
} = useKlinesWebSocket({
  symbol,
  interval,
  updateInterval: 1,
  limit: limitRef,
  enabled,
})

watch(
  wsPending,
  (value) => {
    pending.value = value
  },
  { immediate: true },
)

watch(
  wsError,
  (value) => {
    error.value = value
  },
  { immediate: true },
)

watch(neededKlines, (newLimit) => {
  limitRef.value = newLimit
  if (connected.value) {
    setLimit(newLimit)
  }
})

// Convertir les données WebSocket
watch(
  [wsData, interval],
  ([newWsData]) => {
    console.log('[Chart] WebSocket data received:', {
      dataLength: newWsData?.length || 0,
      interval: interval.value,
      firstPoint: newWsData?.[0],
      lastPoint: newWsData?.[newWsData?.length - 1],
    })

    if (!newWsData || newWsData.length === 0) {
      console.log('[Chart] No WebSocket data, clearing rows')
      rows.value = []
      pending.value = false
      return
    }

    const wsRows: Ohlcv[] = newWsData.map((point, index) => {
      // Log les premiers points pour debug
      if (index < 3) {
        console.log(`[Chart] WebSocket point ${index}:`, {
          original: point,
          t: point.t,
          o: point.o,
          h: point.h,
          l: point.l,
          c: point.c,
          v: point.v,
          tType: typeof point.t,
          tIsValid: Number.isFinite(point.t),
        })
      }

      return {
        t: point.t,
        o: point.o,
        h: point.h,
        l: point.l,
        c: point.c,
        v: point.v,
      }
    })

    wsRows.sort((a, b) => a.t - b.t)

    const uniqueRows = new Map<number, Ohlcv>()
    wsRows.forEach((row) => {
      uniqueRows.set(row.t, row)
    })

    const finalRows = Array.from(uniqueRows.values()).sort((a, b) => a.t - b.t)

    console.log('[Chart] Processed WebSocket data:', {
      originalCount: newWsData.length,
      afterSort: wsRows.length,
      afterDedup: finalRows.length,
      firstRow: finalRows[0],
      lastRow: finalRows[finalRows.length - 1],
    })

    rows.value = finalRows
    pending.value = false
  },
  { immediate: true },
)

function refresh() {
  refreshWS()
}

// Calculer les données affichées
const displayed = computed(() => {
  const r = rows.value
  if (!r.length) return r

  if (WINDOW_MS.value === Infinity) {
    return r
  }

  const now = Date.now()
  const windowStart = now - WINDOW_MS.value

  let inRange = r.filter((row) => row.t >= windowStart && row.t <= now)

  if (inRange.length === 0 && r.length > 0) {
    const maxDisplayed = Math.ceil(WINDOW_MS.value / intervalMs[interval.value])
    const start = Math.max(0, r.length - maxDisplayed)
    return r.slice(start)
  }

  return inRange
})

// Statistiques
const lastChange = computed(() => {
  if (displayed.value.length < 2) return 0
  const last = displayed.value[displayed.value.length - 1]
  const prev = displayed.value[displayed.value.length - 2]
  return last.c - prev.c
})

const lastChangePercent = computed(() => {
  if (displayed.value.length < 2) return 0
  const last = displayed.value[displayed.value.length - 1]
  const prev = displayed.value[displayed.value.length - 2]
  return ((last.c - prev.c) / prev.c) * 100
})

const high24h = computed(() => {
  if (displayed.value.length === 0) return 0
  return Math.max(...displayed.value.map((d) => d.h))
})

const low24h = computed(() => {
  if (displayed.value.length === 0) return 0
  return Math.min(...displayed.value.map((d) => d.l))
})

const volume24h = computed(() => {
  return displayed.value.reduce((sum, d) => sum + d.v, 0)
})

// Lightweight Charts
const chartContainer = ref<HTMLDivElement | null>(null)
let chart: ChartApi | null = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let candleSeries: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let volSeries: any = null
let resizeObserver: ResizeObserver | null = null
const isUserZooming = ref(false)
let zoomResetTimer: ReturnType<typeof setTimeout> | null = null

function initChart() {
  if (!chartContainer.value || chart) return

  chart = createChart(chartContainer.value, {
    layout: {
      background: { type: ColorType.Solid, color: 'transparent' },
      textColor: '#9CA3AF',
      fontSize: 11,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    width: chartContainer.value.clientWidth,
    height: 500,
    grid: {
      vertLines: {
        color: 'rgba(255, 255, 255, 0.05)',
        style: 0,
      },
      horzLines: {
        color: 'rgba(255, 255, 255, 0.05)',
        style: 0,
      },
    },
    crosshair: {
      mode: 1,
      vertLine: {
        color: 'rgba(255, 255, 255, 0.1)',
        width: 1,
        style: 3,
      },
      horzLine: {
        color: 'rgba(255, 255, 255, 0.1)',
        width: 1,
        style: 3,
      },
    },
    rightPriceScale: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    },
    leftPriceScale: {
      visible: false,
    },
    timeScale: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      timeVisible: true,
      secondsVisible: false,
    },
  })

  // Détecter quand l'utilisateur change le zoom/pan via les événements du chart
  chart.subscribeClick((param) => {
    if (param.point) {
      isUserZooming.value = true
      resetZoomTimer()
    }
  })

  // Écouter les changements de visible range (zoom/pan)
  chart.timeScale().subscribeVisibleTimeRangeChange(() => {
    // Si c'est un changement manuel (pas programmatique), marquer comme zoom utilisateur
    if (!isUserZooming.value) {
      // Détecter si c'est un zoom utilisateur en vérifiant si on est dans updateChart
      // On utilise un flag pour savoir si on est en train de mettre à jour programmatiquement
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wasUpdating = (window as any).__chartUpdating
      if (!wasUpdating) {
        isUserZooming.value = true
        resetZoomTimer()
      }
    }
  })

  function resetZoomTimer() {
    if (zoomResetTimer) {
      clearTimeout(zoomResetTimer)
    }
    zoomResetTimer = setTimeout(() => {
      isUserZooming.value = false
      console.log('[Chart] Auto-zoom re-enabled after user inactivity')
    }, 5000)
  }

  // Utiliser addSeries avec les définitions de séries correctes
  try {
    console.log('[Chart] Creating candlestick series...', { CandlestickSeries })
    candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })
    console.log('[Chart] Candlestick series created:', candleSeries)

    console.log('[Chart] Creating histogram series...', { HistogramSeries })
    volSeries = chart.addSeries(HistogramSeries, {
      color: '#10B981',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })
    console.log('[Chart] Histogram series created:', volSeries)

    // Masquer le volume par défaut si showVolume est false
    if (!showVolume.value) {
      volSeries.setData([])
    }

    // Créer les séries d'indicateurs (mais ne pas les afficher encore)
    sma20Series = chart.addSeries(LineSeries, {
      color: '#3B82F6',
      lineWidth: 1,
      title: 'SMA 20',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })
    sma20Series.setData([])

    sma50Series = chart.addSeries(LineSeries, {
      color: '#8B5CF6',
      lineWidth: 1,
      title: 'SMA 50',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })
    sma50Series.setData([])

    ema20Series = chart.addSeries(LineSeries, {
      color: '#F59E0B',
      lineWidth: 1,
      title: 'EMA 20',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })
    ema20Series.setData([])

    // RSI dans un panneau séparé (priceScaleId différent)
    rsiSeries = chart.addSeries(LineSeries, {
      color: '#EC4899',
      lineWidth: 1,
      title: 'RSI',
      priceScaleId: 'rsi',
      priceFormat: {
        type: 'price',
        precision: 1,
        minMove: 0.1,
      },
    })
    rsiSeries.setData([])

    // Configurer l'échelle RSI (0-100) - panneau séparé en bas
    chart.priceScale('rsi').applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0.1,
      },
      visible: true,
      entireTextOnly: false,
    })
  } catch (err) {
    console.error('[Chart] Error creating series:', err)
    throw err
  }

  // Resize observer
  resizeObserver = new ResizeObserver(() => {
    if (chart && chartContainer.value) {
      chart.applyOptions({
        width: chartContainer.value.clientWidth,
        height: 500,
      })
    }
  })
  resizeObserver.observe(chartContainer.value)
}

function updateChart() {
  if (!chart || !candleSeries || !volSeries || displayed.value.length === 0) return

  console.log('[Chart] Update chart called', {
    displayedCount: displayed.value.length,
    interval: interval.value,
    selectedRange: selectedRange.value,
    windowMs: WINDOW_MS.value,
    windowSec: WINDOW_SEC.value,
  })

  // Filtrer et valider les données
  const dataMap = new Map<number, { candle: CandlestickData; volume: HistogramData }>()
  let invalidCount = 0
  let duplicateCount = 0

  displayed.value.forEach((r, index) => {
    // Valider les valeurs
    const time = Math.floor(r.t / 1000) // Convertir en secondes (Unix timestamp)
    const open = Number(r.o)
    const high = Number(r.h)
    const low = Number(r.l)
    const close = Number(r.c)
    const volume = Number(r.v)

    // Log des premières données pour debug
    if (index < 3) {
      console.log(`[Chart] Data point ${index}:`, {
        original: { t: r.t, o: r.o, h: r.h, l: r.l, c: r.c, v: r.v },
        converted: { time, open, high, low, close, volume },
        isValid: {
          time: Number.isFinite(time) && time > 0,
          open: Number.isFinite(open) && open > 0,
          high: Number.isFinite(high) && high > 0,
          low: Number.isFinite(low) && low > 0,
          close: Number.isFinite(close) && close > 0,
          volume: Number.isFinite(volume) && volume >= 0,
          ohlcValid: high >= low && open >= low && open <= high && close >= low && close <= high,
        },
      })
    }

    // Vérifier que toutes les valeurs sont valides
    if (
      !Number.isFinite(time) ||
      !Number.isFinite(open) ||
      !Number.isFinite(high) ||
      !Number.isFinite(low) ||
      !Number.isFinite(close) ||
      !Number.isFinite(volume) ||
      time <= 0 ||
      open <= 0 ||
      high <= 0 ||
      low <= 0 ||
      close <= 0 ||
      volume < 0 ||
      high < low ||
      open < low ||
      open > high ||
      close < low ||
      close > high
    ) {
      invalidCount++
      if (invalidCount <= 5) {
        console.warn(`[Chart] Invalid data point ${index}:`, {
          time,
          open,
          high,
          low,
          close,
          volume,
          checks: {
            timeValid: Number.isFinite(time) && time > 0,
            openValid: Number.isFinite(open) && open > 0,
            highValid: Number.isFinite(high) && high > 0,
            lowValid: Number.isFinite(low) && low > 0,
            closeValid: Number.isFinite(close) && close > 0,
            volumeValid: Number.isFinite(volume) && volume >= 0,
            ohlcValid: high >= low && open >= low && open <= high && close >= low && close <= high,
          },
        })
      }
      return // Ignorer les données invalides
    }

    // Utiliser un Map pour éviter les doublons de timestamps
    if (dataMap.has(time)) {
      duplicateCount++
      return
    }

    const prev = index > 0 ? displayed.value[index - 1] : null
    const color = !prev || close >= prev.c ? '#10B981' : '#EF4444'

    dataMap.set(time, {
      candle: {
        time: time as Time,
        open,
        high,
        low,
        close,
      },
      volume: {
        time: time as Time,
        value: volume,
        color,
      },
    })
  })

  if (invalidCount > 0) {
    console.warn(`[Chart] Total invalid data points: ${invalidCount}`)
  }
  if (duplicateCount > 0) {
    console.warn(`[Chart] Total duplicate timestamps: ${duplicateCount}`)
  }

  if (dataMap.size === 0) {
    console.error('[Chart] No valid data points after filtering')
    return
  }

  // Convertir en arrays et trier par time (ordre croissant)
  const sortedEntries = Array.from(dataMap.entries()).sort((a, b) => a[0] - b[0])
  const validCandleData = sortedEntries.map(([, data]) => data.candle)
  const validVolumeData = sortedEntries.map(([, data]) => data.volume)

  console.log('[Chart] Final data:', {
    validCount: validCandleData.length,
    firstTime: validCandleData[0]?.time,
    lastTime: validCandleData[validCandleData.length - 1]?.time,
    firstCandle: validCandleData[0],
    lastCandle: validCandleData[validCandleData.length - 1],
    isSorted: validCandleData.every((d, i) => i === 0 || d.time >= validCandleData[i - 1].time),
  })

  try {
    candleSeries.setData(validCandleData)
    console.log('[Chart] Data set successfully')

    // Mettre à jour les indicateurs après avoir mis à jour les données
    nextTick(() => {
      updateIndicators()
    })
  } catch (err) {
    console.error('[Chart] Error setting chart data:', err, {
      candleDataLength: validCandleData.length,
      volumeDataLength: validVolumeData.length,
      firstTime: validCandleData[0]?.time,
      lastTime: validCandleData[validCandleData.length - 1]?.time,
      firstCandle: validCandleData[0],
      lastCandle: validCandleData[validCandleData.length - 1],
    })
  }

  // Ajuster la vue seulement si l'utilisateur n'a pas zoomé
  if (isUserZooming.value) {
    console.log('[Chart] User is zooming, skipping auto-zoom')
    return
  }

  // Marquer qu'on est en train de mettre à jour programmatiquement
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__chartUpdating = true

  try {
    // Ajuster la vue
    if (WINDOW_MS.value === Infinity) {
      chart.timeScale().fitContent()
    } else {
      const last = displayed.value[displayed.value.length - 1]
      if (last) {
        const to = last.t / 1000
        const from = Math.max(displayed.value[0].t / 1000, to - WINDOW_SEC.value)
        chart.timeScale().setVisibleRange({ from: from as Time, to: to as Time })
      }
    }
  } finally {
    // Réinitialiser le flag après un court délai pour permettre aux événements de se déclencher
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__chartUpdating = false
    }, 100)
  }
}

// Computed pour l'UI
const baseSymbol = computed(
  () => symbol.value?.replace(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/, '') || symbol.value,
)

// Formatters
function formatPrice(n: number) {
  const abs = Math.abs(n)
  const dec = abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 1 ? 2 : 4
  return n.toLocaleString(undefined, {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  })
}

function formatVolume(n: number) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return String(Math.round(n))
}

// Initialiser le chart
onMounted(() => {
  nextTick(() => {
    if (chartContainer.value) {
      initChart()
      // Attendre un peu pour que le chart soit complètement initialisé
      setTimeout(() => {
        updateChart()
      }, 100)
    }
  })
})

// Fonctions de calcul des indicateurs
function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(NaN)
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }
  }
  return sma
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(data[i])
    } else {
      ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1])
    }
  }
  return ema
}

function calculateRSI(data: number[], period: number = 14): number[] {
  const rsi: number[] = []
  const changes: number[] = []

  // Calculer les changements
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1])
  }

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      rsi.push(NaN)
    } else {
      const recentChanges = changes.slice(i - period, i)
      const gains = recentChanges.filter((c) => c > 0).reduce((a, b) => a + b, 0) / period
      const losses =
        Math.abs(recentChanges.filter((c) => c < 0).reduce((a, b) => a + b, 0)) / period

      if (losses === 0) {
        rsi.push(100)
      } else {
        const rs = gains / losses
        rsi.push(100 - 100 / (1 + rs))
      }
    }
  }

  return rsi
}

// Fonction pour basculer un indicateur
function toggleIndicator(indicator: 'volume' | 'sma20' | 'sma50' | 'ema20' | 'rsi') {
  activeIndicators.value[indicator] = !activeIndicators.value[indicator]
  updateIndicators()
  // Synchroniser avec selectedIndicators
  syncSelectedIndicators()
}

// Fonction pour sélectionner tous les indicateurs
function selectAllIndicators() {
  activeIndicators.value = {
    volume: true,
    sma20: true,
    sma50: true,
    ema20: true,
    rsi: true,
  }
  updateIndicators()
  syncSelectedIndicators()
}

// Fonction pour désélectionner tous les indicateurs
function deselectAllIndicators() {
  activeIndicators.value = {
    volume: false,
    sma20: false,
    sma50: false,
    ema20: false,
    rsi: false,
  }
  updateIndicators()
  syncSelectedIndicators()
}

// Synchroniser selectedIndicators avec activeIndicators
function syncSelectedIndicators() {
  const selected: string[] = []
  if (activeIndicators.value.volume) selected.push('volume')
  if (activeIndicators.value.sma20) selected.push('sma20')
  if (activeIndicators.value.sma50) selected.push('sma50')
  if (activeIndicators.value.ema20) selected.push('ema20')
  if (activeIndicators.value.rsi) selected.push('rsi')
  selectedIndicators.value = selected
}

// Mettre à jour les indicateurs
function updateIndicators() {
  if (!chart || displayed.value.length === 0) return

  const closes = displayed.value.map((r) => r.c)
  const times = displayed.value.map((r) => Math.floor(r.t / 1000))

  // Volume
  if (volSeries) {
    if (activeIndicators.value.volume) {
      const volumeData: HistogramData[] = displayed.value.map((r, index) => {
        const time = Math.floor(r.t / 1000)
        const prev = index > 0 ? displayed.value[index - 1] : null
        const color = !prev || r.c >= prev.c ? '#10B981' : '#EF4444'
        return {
          time: time as Time,
          value: r.v,
          color,
        }
      })
      volSeries.setData(volumeData)
    } else {
      volSeries.setData([])
    }
  }

  // SMA 20
  if (sma20Series) {
    if (activeIndicators.value.sma20) {
      const sma20 = calculateSMA(closes, 20)
      const sma20Data: LineData[] = times
        .map((time, i) => ({
          time: time as Time,
          value: sma20[i],
        }))
        .filter((d) => Number.isFinite(d.value))
      sma20Series.setData(sma20Data)
    } else {
      sma20Series.setData([])
    }
  }

  // SMA 50
  if (sma50Series) {
    if (activeIndicators.value.sma50) {
      const sma50 = calculateSMA(closes, 50)
      const sma50Data: LineData[] = times
        .map((time, i) => ({
          time: time as Time,
          value: sma50[i],
        }))
        .filter((d) => Number.isFinite(d.value))
      sma50Series.setData(sma50Data)
    } else {
      sma50Series.setData([])
    }
  }

  // EMA 20
  if (ema20Series) {
    if (activeIndicators.value.ema20) {
      const ema20 = calculateEMA(closes, 20)
      const ema20Data: LineData[] = times
        .map((time, i) => ({
          time: time as Time,
          value: ema20[i],
        }))
        .filter((d) => Number.isFinite(d.value))
      ema20Series.setData(ema20Data)
    } else {
      ema20Series.setData([])
    }
  }

  // RSI
  if (rsiSeries) {
    if (activeIndicators.value.rsi) {
      const rsi = calculateRSI(closes, 14)
      const rsiData: LineData[] = times
        .map((time, i) => ({
          time: time as Time,
          value: rsi[i],
        }))
        .filter((d) => Number.isFinite(d.value))
      rsiSeries.setData(rsiData)
    } else {
      rsiSeries.setData([])
    }
  }
}

// Synchroniser selectedIndicators avec activeIndicators au démarrage
watch(
  activeIndicators,
  () => {
    syncSelectedIndicators()
  },
  { deep: true, immediate: true },
)

// Mettre à jour le chart quand les données changent
watch([displayed, interval, selectedRange], () => {
  // Réinitialiser le flag de zoom quand on change d'intervalle ou de plage
  if (isUserZooming.value) {
    isUserZooming.value = false
    if (zoomResetTimer) {
      clearTimeout(zoomResetTimer)
      zoomResetTimer = null
    }
  }

  nextTick(() => {
    if (!chart || !candleSeries || !volSeries) {
      if (chartContainer.value) {
        initChart()
        setTimeout(() => {
          updateChart()
        }, 100)
      }
      return
    }
    updateChart()
  })
})

// Mettre à jour les indicateurs quand ils changent
watch(
  activeIndicators,
  () => {
    updateIndicators()
  },
  { deep: true },
)

// Nettoyage
onBeforeUnmount(() => {
  if (zoomResetTimer) {
    clearTimeout(zoomResetTimer)
    zoomResetTimer = null
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (chart) {
    chart.remove()
    chart = null
  }
  enabled.value = false
  disconnectWS()
})
</script>
