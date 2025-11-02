<template>
  <div class="bg-neutral-900/60 border border-white/5 rounded-2xl overflow-hidden">
    <div class="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-3">
        <div class="text-sm">
          <div class="font-semibold">Market Chart</div>
          <div class="text-white/40 tabular-nums">
            <span v-if="!pending">
              {{ baseSymbol }} • {{ interval }}
              <span v-if="rangeText" class="ml-2 text-white/30">({{ rangeText }})</span>
            </span>
            <span v-else class="inline-block w-40 h-4 bg-white/10 animate-pulse rounded"></span>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <div
          class="relative inline-grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1 text-xs"
          role="tablist"
          aria-label="Interval"
        >
          <div
            class="absolute inset-y-1 w-1/2 rounded-lg bg-white/10 transition-transform duration-300"
            :style="{ transform: `translateX(${intervalIndex * 100}%)` }"
            aria-hidden="true"
          />
          <button
            v-for="it in intervals"
            :key="it"
            role="tab"
            class="relative z-10 px-2.5 py-1.5 rounded-lg transition-colors"
            :class="interval === it ? 'text-white' : 'text-white/60 hover:text-white/90'"
            @click="interval = it"
          >
            {{ it }}
          </button>
        </div>

        <div
          class="relative inline-grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1 text-xs"
          role="tablist"
          aria-label="Time Range"
        >
          <div
            class="absolute inset-y-1 w-1/2 rounded-lg bg-white/10 transition-transform duration-300"
            :style="{ transform: `translateX(${rangeIndex * 100}%)` }"
            aria-hidden="true"
          />
          <button
            v-for="r in timeRanges"
            :key="r.value"
            role="tab"
            class="relative z-10 px-2.5 py-1.5 rounded-lg transition-colors"
            :class="selectedRange === r.value ? 'text-white' : 'text-white/60 hover:text-white/90'"
            @click="selectedRange = r.value"
          >
            {{ r.label }}
          </button>
        </div>

        <span
          v-if="connected"
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-green-500/20 text-green-400"
        >
          <Icon name="lucide:radio" class="h-4 w-4" /> Live
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-white/40"
        >
          <Icon name="lucide:wifi-off" class="h-4 w-4" /> Offline
        </span>

        <button
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10"
          @click="fetchData"
        >
          <Icon name="lucide:refresh-ccw" class="h-4 w-4" /> Refresh
        </button>
      </div>
    </div>
    <ClientOnly>
      <div v-if="pending" class="h-[430px] p-4">
        <div class="h-full rounded-lg bg-white/5 animate-pulse" />
      </div>

      <div
        v-else-if="!error && displayed.length === 0"
        class="h-[430px] grid place-items-center text-center p-6"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-center gap-2 text-white/70">
            <Icon name="lucide:info" class="h-5 w-5" />
            <span>No data available for this cryptocurrency at this time.</span>
          </div>

          <div class="flex items-center justify-center gap-3">
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10"
              @click="fetchData"
            >
              <Icon name="lucide:refresh-ccw" class="h-4 w-4" /> Refresh
            </button>

            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20"
              @click="$emit('switch-chart', 'tv')"
              aria-label="Voir le graphique TradingView"
            >
              <Icon name="lucide:line-chart" class="h-4 w-4" /> See TradingView
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="error" class="h-[430px] grid place-items-center text-center p-6">
        <div class="space-y-3 text-red-400/90">
          <div class="flex items-center justify-center gap-2">
            <Icon name="lucide:alert-triangle" class="h-5 w-5" />
            <span>Unable to load the graph.</span>
          </div>
          <div class="flex items-center justify-center gap-2 text-white/70 text-sm max-w-md">
            <span>{{ error }}</span>
          </div>
          <div class="text-xs text-white/50 max-w-md">
            <p v-if="error.includes('server') || error.includes('Server')">
              This appears to be a server-side error. Please check the server logs for more details.
            </p>
          </div>
          <div class="flex items-center justify-center gap-3">
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/80"
              @click="fetchData"
            >
              <Icon name="lucide:refresh-ccw" class="h-4 w-4" /> Try again
            </button>
            <button
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/10 hover:bg-white/20"
              @click="$emit('switch-chart', 'tv')"
            >
              <Icon name="lucide:line-chart" class="h-4 w-4" /> See TradingView
            </button>
          </div>
        </div>
      </div>

      <apexchart v-else type="candlestick" height="430" :options="options" :series="series" />

      <template #fallback>
        <div class="h-[430px] grid place-items-center">Load chart…</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import ApexCharts from 'apexcharts'
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { useKlinesWebSocket } from '~/composables/useKlinesWebSocket'

type Interval = '30m' | '1h'
const props = defineProps<{ symbol: string; interval?: Interval }>()

type TimeRange = '1d' | '7d'
const timeRanges: Array<{ label: string; value: TimeRange; seconds: number }> = [
  { label: '1D', value: '1d', seconds: 24 * 60 * 60 },
  { label: '7D', value: '7d', seconds: 7 * 24 * 60 * 60 },
]

const selectedRange = ref<TimeRange>('1d')
const WINDOW_SEC = computed(() => {
  const range = timeRanges.find((r) => r.value === selectedRange.value)
  return range?.seconds ?? 24 * 60 * 60
})
const WINDOW_MS = computed(() => WINDOW_SEC.value * 1000)

const intervals: Interval[] = ['30m', '1h']
const intervalMs: Record<Interval, number> = {
  '30m': 30 * 60_000,
  '1h': 60 * 60_000,
}

const symbol = ref(props.symbol)
const interval = ref<Interval>(props.interval ?? '1h')
const rangeIndex = computed(() => {
  return Math.max(
    0,
    timeRanges.findIndex((r) => r.value === selectedRange.value),
  )
})

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

type Ohlcv = { t: number; o: number; h: number; l: number; c: number; v: number }

const rows = ref<Ohlcv[]>([])
const pending = ref(false)
const error = ref<unknown>(null)
const effectiveFromSec = ref<number | null>(null)
const effectiveToSec = ref<number | null>(null)

// Utiliser uniquement les WebSockets pour les données
const enabled = ref(true)
const {
  data: wsData,
  connected,
  pending: wsPending,
  error: wsError,
  refresh: refreshWS,
  disconnect: disconnectWS,
} = useKlinesWebSocket({
  symbol,
  interval,
  updateInterval: 1, // Mise à jour toutes les secondes
  enabled,
})

// Mettre à jour pending et error depuis le WebSocket
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

// Convertir les données WebSocket en format Ohlcv
watch(
  [wsData, interval],
  ([newWsData]) => {
    if (!newWsData || newWsData.length === 0) {
      rows.value = []
      effectiveFromSec.value = null
      effectiveToSec.value = null
      pending.value = false
      return
    }

    // Convertir les données WebSocket en format Ohlcv
    const wsRows: Ohlcv[] = newWsData.map((point) => ({
      t: point.t,
      o: point.o,
      h: point.h,
      l: point.l,
      c: point.c,
      v: point.v,
    }))

    // Trier par timestamp (ascendant)
    wsRows.sort((a, b) => a.t - b.t)

    // Filtrer les doublons par timestamp
    const uniqueRows = new Map<number, Ohlcv>()
    wsRows.forEach((row) => {
      uniqueRows.set(row.t, row)
    })

    // Convertir en array et trier à nouveau
    const sortedRows = Array.from(uniqueRows.values()).sort((a, b) => a.t - b.t)

    // Utiliser toutes les données disponibles
    rows.value = sortedRows
    pending.value = false // Les données sont arrivées

    // Mettre à jour les plages effectives
    if (sortedRows.length > 0) {
      effectiveFromSec.value = Math.floor(sortedRows[0].t / 1000)
      effectiveToSec.value = Math.floor(sortedRows[sortedRows.length - 1].t / 1000)
    }
  },
  { immediate: true },
)

// Fonction pour rafraîchir les données (demander les dernières via WebSocket)
function fetchData() {
  refreshWS()
}

// Réinitialiser le zoom et les données quand on change de plage ou d'intervalle
watch([selectedRange, interval], async () => {
  isUserZooming.value = false
  // Réinitialiser les données pour forcer le réaffichage avec le nouvel intervalle
  rows.value = []
  pending.value = true

  // Forcer la mise à jour du graphique immédiatement
  await nextTick()
  try {
    // Mettre à jour les séries avec des données vides pour forcer le réaffichage
    ApexCharts.exec('market-apex-klines', 'updateSeries', [{ data: [] }, { data: [] }])
    // Mettre à jour les options si nécessaire (notamment xaxis.range)
    ApexCharts.exec(
      'market-apex-klines',
      'updateOptions',
      {
        xaxis: {
          range: WINDOW_MS.value,
        },
      },
      false,
      true,
      false,
    )
  } catch {
    // Ignore si le chart n'est pas encore initialisé
  }

  // Le WebSocket se reconnecte automatiquement avec le nouvel intervalle
})

const neededCount = computed(() => {
  // Calculer le nombre de points nécessaires selon l'intervalle et la plage
  const intervalMsValue = intervalMs[interval.value]
  return Math.max(1, Math.ceil(WINDOW_MS.value / intervalMsValue))
})

const displayed = computed(() => {
  const r = rows.value
  if (!r.length) return r

  // Calculer la plage temporelle cible selon l'intervalle et la plage sélectionnée
  const now = Date.now()
  const windowStart = now - WINDOW_MS.value

  // Filtrer les données dans la plage temporelle
  let inRange = r.filter((row) => row.t >= windowStart && row.t <= now)

  // Utiliser le nombre calculé de points nécessaires
  const maxDisplayed = neededCount.value

  // Si on a des données dans la plage, prendre les dernières
  if (inRange.length > 0) {
    // Prendre les maxDisplayed dernières données de la plage
    const start = Math.max(0, inRange.length - maxDisplayed)
    return inRange.slice(start)
  }

  // Sinon, si on a des données mais pas dans la plage récente,
  // prendre les maxDisplayed dernières données disponibles (peut être utile pour les données historiques)
  if (r.length > 0) {
    const start = Math.max(0, r.length - maxDisplayed)
    return r.slice(start)
  }

  return []
})

const candleSeries = computed(() =>
  displayed.value.map((r) => ({ x: new Date(r.t), y: [r.o, r.h, r.l, r.c] })),
)

// Fonction pour déterminer la couleur du volume (verte si hausse, rouge si baisse)
function getVolumeColor(index: number): string {
  if (index === 0) return '#10B981'
  const current = displayed.value[index]
  const previous = displayed.value[index - 1]
  if (current && previous) {
    return current.c >= previous.c ? '#10B981' : '#EF4444'
  }
  return '#94A3B8'
}

// Série de volume avec couleurs dynamiques selon la direction du prix
const volumeSeriesColored = computed(() =>
  displayed.value.map((r, index) => ({
    x: new Date(r.t),
    y: r.v,
    fillColor: getVolumeColor(index),
  })),
)

const series = computed(() => [
  { name: 'Price', type: 'candlestick' as const, data: candleSeries.value },
  {
    name: 'Volume',
    type: 'column' as const,
    data: volumeSeriesColored.value,
  },
])

const baseSymbol = computed(
  () => symbol.value?.replace(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/, '') || symbol.value,
)
const intervalIndex = computed(() =>
  Math.max(
    0,
    intervals.findIndex((i) => i === interval.value),
  ),
)

function formatPrice(n: number) {
  const abs = Math.abs(n)
  const dec = abs >= 1000 ? 0 : abs >= 100 ? 1 : abs >= 1 ? 2 : 4
  return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })
}
function fmtDateSec(sec: number) {
  const d = new Date(sec * 1000)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
const rangeText = computed(() => {
  if (!displayed.value.length) return ''
  const start = Math.floor(displayed.value[0].t / 1000)
  const end = Math.floor(displayed.value.at(-1)!.t / 1000)
  return `${fmtDateSec(start)} → ${fmtDateSec(end)}`
})
function formatVolume(n: number) {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return String(Math.round(n))
}

const isUserZooming = ref(false)

function clampToData(min: number, max: number) {
  const data = displayed.value
  if (!data.length) return { min, max }
  const dataMin = data[0].t
  const dataMax = data.at(-1)!.t
  const span = max - min

  // Permettre un petit débordement pour un zoom plus fluide
  const padding = span * 0.1
  const paddedMin = dataMin - padding
  const paddedMax = dataMax + padding

  if (min < paddedMin) {
    min = Math.max(paddedMin, dataMin - span)
    max = min + span
  }
  if (max > paddedMax) {
    max = Math.min(paddedMax, dataMax + span)
    min = max - span
  }
  return { min, max }
}

const options = computed(() => {
  return {
    chart: {
      id: 'market-apex-klines',
      background: 'transparent',
      animations: { enabled: true, speed: 300, animateGradually: { enabled: true } },
      foreColor: '#9CA3AF',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      toolbar: {
        show: true,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: false,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
        autoSelected: 'zoom',
      },
      zoom: {
        enabled: true,
        type: 'x',
        autoScaleYaxis: true,
      },
      selection: {
        enabled: true,
        type: 'x',
        fill: {
          color: 'rgba(59, 130, 246, 0.2)',
          opacity: 0.4,
        },
        stroke: {
          width: 1,
          dashArray: 5,
          color: 'rgba(59, 130, 246, 1)',
          opacity: 0.4,
        },
      },
      brush: {
        enabled: false,
      },
      events: {
        selection: (chart: unknown, { xaxis }: { xaxis: { min: number; max: number } }) => {
          if (xaxis?.min && xaxis?.max) {
            isUserZooming.value = true
            // Zoomer automatiquement sur la sélection
            ApexCharts.exec('market-apex-klines', 'zoomX', xaxis.min, xaxis.max)
          }
        },
        dataPointSelection: () => {
          isUserZooming.value = true
        },
        zoomed: (_ctx: unknown, { xaxis }: { xaxis: { min: number; max: number } }): void => {
          if ((!xaxis?.min && xaxis?.min !== 0) || (!xaxis?.max && xaxis?.max !== 0)) return
          isUserZooming.value = true
        },
        beforeResetZoom: () => {
          isUserZooming.value = false
          const last = displayed.value.at(-1)
          if (!last) return undefined
          const max = last.t
          const min = max - WINDOW_MS.value
          const { min: m, max: M } = clampToData(min, max)
          return { xaxis: { min: m, max: M } }
        },
      },
    },

    grid: {
      borderColor: 'rgba(255, 255, 255, 0.05)',
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 12,
        bottom: 0,
        left: 12,
      },
    },

    theme: { mode: 'dark' as const },
    xaxis: {
      type: 'datetime' as const,
      labels: {
        datetimeUTC: false,
        style: {
          fontSize: '11px',
          colors: '#6B7280',
          fontFamily: 'inherit',
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm',
        },
        maxHeight: 60,
        rotate: 0,
        rotateAlways: false,
        hideOverlappingLabels: true,
        showDuplicates: false,
      },
      axisBorder: {
        show: true,
        color: 'rgba(255, 255, 255, 0.05)',
        height: 1,
        width: '100%',
        offsetX: 0,
        offsetY: 0,
      },
      axisTicks: {
        show: true,
        borderType: 'solid',
        color: 'rgba(255, 255, 255, 0.05)',
        height: 4,
        offsetX: 0,
        offsetY: 0,
      },
      tooltip: {
        enabled: false,
      },
      range: WINDOW_MS.value,
    },
    yaxis: [
      {
        seriesName: 'Price',
        opposite: false,
        tooltip: { enabled: true },
        decimalsInFloat: 2,
        labels: {
          formatter: (v: number) => formatPrice(v),
          style: {
            fontSize: '11px',
            colors: '#D1D5DB',
            fontFamily: 'inherit',
          },
          align: 'right',
          offsetX: -10,
        },
        axisBorder: {
          show: true,
          color: 'rgba(255, 255, 255, 0.05)',
          width: 1,
          offsetX: 0,
          offsetY: 0,
        },
        axisTicks: {
          show: true,
          borderType: 'solid',
          color: 'rgba(255, 255, 255, 0.05)',
          width: 4,
          offsetX: 0,
          offsetY: 0,
        },
      },
      {
        seriesName: 'Volume',
        opposite: true,
        decimalsInFloat: 0,
        labels: {
          formatter: (v: number) => formatVolume(v),
          style: {
            fontSize: '11px',
            colors: '#6B7280',
            fontFamily: 'inherit',
          },
          align: 'left',
          offsetX: 10,
        },
        axisBorder: {
          show: true,
          color: 'rgba(255, 255, 255, 0.05)',
          width: 1,
          offsetX: 0,
          offsetY: 0,
        },
        axisTicks: {
          show: true,
          borderType: 'solid',
          color: 'rgba(255, 255, 255, 0.05)',
          width: 4,
          offsetX: 0,
          offsetY: 0,
        },
      },
    ],
    stroke: {
      width: [1.5, 0],
      curve: 'straight' as const,
      dashArray: [0, 0],
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10B981', // Vert TradingView
          downward: '#EF4444', // Rouge TradingView
        },
        wick: {
          useFillColor: true,
          wickColor: {
            upward: '#10B981',
            downward: '#EF4444',
          },
        },
        barColors: {
          upward: '#10B981',
          downward: '#EF4444',
        },
      },
      bar: {
        columnWidth: '80%',
        colors: {
          ranges: [],
        },
        distributed: false,
        borderRadius: 0,
      },
    },
    dataLabels: { enabled: false },
    legend: {
      show: false,
    },
    tooltip: {
      shared: true,
      intersect: false,
      followCursor: true,
      theme: 'dark',
      style: {
        fontSize: '12px',
        fontFamily: 'inherit',
      },
      x: {
        show: true,
        format: 'dd MMM yyyy HH:mm:ss',
        formatter: undefined,
      },
      y: [
        {
          formatter: (
            v: number,
            {
              dataPointIndex,
              w,
            }: {
              dataPointIndex: number
              w?: {
                config?: {
                  series?: Array<{
                    data?: Array<{
                      y?: number | number[]
                      x?: number
                    }>
                  }>
                }
              }
            },
          ) => {
            const ohlc = w?.config?.series?.[0]?.data?.[dataPointIndex]?.y
            if (!Array.isArray(ohlc)) return formatPrice(v)
            const [o, h, l, c] = ohlc
            const change = c - o
            const changePercent = ((change / o) * 100).toFixed(2)
            const color = change >= 0 ? '#10B981' : '#EF4444'
            return `<div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 11px;">
              <span style="color: #9CA3AF;">O</span>
              <span style="color: #D1D5DB; text-align: right;">${formatPrice(o)}</span>
              <span style="color: #9CA3AF;">H</span>
              <span style="color: #D1D5DB; text-align: right;">${formatPrice(h)}</span>
              <span style="color: #9CA3AF;">L</span>
              <span style="color: #D1D5DB; text-align: right;">${formatPrice(l)}</span>
              <span style="color: #9CA3AF;">C</span>
              <span style="color: ${color}; text-align: right; font-weight: 600;">${formatPrice(c)}</span>
            </div>
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1);">
              <span style="color: ${color}; font-weight: 600;">${change >= 0 ? '+' : ''}${changePercent}%</span>
            </div>
          </div>`
          },
          title: { formatter: () => '' },
        },
        {
          formatter: (v: number) => formatVolume(v),
          title: { formatter: () => 'Volume: ' },
        },
      ],
      marker: {
        show: true,
        fillColors: ['#10B981', 'rgba(148, 163, 184, 0.45)'],
      },
    },
    markers: { size: 0 },
    crosshairs: {
      show: true,
      position: 'front' as const,
      stroke: {
        color: 'rgba(255, 255, 255, 0.1)',
        width: 1,
        dashArray: 3,
      },
    },
    fill: {
      type: 'solid',
      opacity: 1,
    },
  }
})

watch([displayed, interval, selectedRange], async () => {
  await nextTick()

  const data = displayed.value
  const candleData = candleSeries.value
  const volumeData = volumeSeriesColored.value

  // Mettre à jour les séries du graphique
  try {
    ApexCharts.exec('market-apex-klines', 'updateSeries', [
      { data: candleData },
      { data: volumeData },
    ])
  } catch {
    // Ignore si le chart n'est pas encore initialisé
  }

  // Ne pas forcer le zoom si l'utilisateur a zoomé manuellement
  if (isUserZooming.value) return

  if (!data || data.length === 0) {
    // Si pas de données, réinitialiser le zoom
    try {
      ApexCharts.exec(
        'market-apex-klines',
        'updateOptions',
        {
          xaxis: {
            range: WINDOW_MS.value,
          },
        },
        false,
        true,
        false,
      )
    } catch {
      // Ignore si le chart n'est pas encore initialisé
    }
    return
  }

  const first = data[0]
  const last = data[data.length - 1]
  if (!first || !last) return

  // Zoomer sur la plage complète des données affichées
  const max = last.t
  const min = Math.max(first.t, max - WINDOW_MS.value)

  // Utiliser setTimeout pour s'assurer que le graphique est prêt
  setTimeout(() => {
    try {
      ApexCharts.exec('market-apex-klines', 'zoomX', min, max)
    } catch {
      // Ignore si le chart n'est pas encore initialisé
    }
  }, 100)
})

// Réinitialiser le flag de zoom utilisateur après un délai
watch(
  () => displayed.value.length,
  () => {
    if (isUserZooming.value) {
      // Réinitialiser après 5 secondes d'inactivité pour permettre le suivi automatique
      setTimeout(() => {
        isUserZooming.value = false
      }, 5000)
    }
  },
)

// Déconnexion explicite quand on quitte le composant
onBeforeUnmount(() => {
  enabled.value = false
  disconnectWS()
})
</script>
