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

        <span
          class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-white/70"
        >
          <Icon name="lucide:clock" class="h-4 w-4" /> Range: 24H
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
          <div class="flex items-center justify-center gap-2 text-white/70">
            <span>No data available for this cryptocurrency at this time.</span>
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

      <apexchart v-else type="line" height="430" :options="options" :series="series" />

      <template #fallback>
        <div class="h-[430px] grid place-items-center">Load chart…</div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import ApexCharts from 'apexcharts'
import { computed, onMounted, ref, watch, nextTick } from 'vue'

type Interval = '30m' | '1h'
const props = defineProps<{ symbol: string; interval?: Interval }>()

const BASE_URL = 'http://127.0.0.1:8004'
const WINDOW_SEC = 24 * 60 * 60
const WINDOW_MS = WINDOW_SEC * 1000
const intervals: Interval[] = ['30m', '1h']
const intervalMs: Record<Interval, number> = {
  '30m': 30 * 60_000,
  '1h': 60 * 60_000,
}

const symbol = ref(props.symbol)
const interval = ref<Interval>(props.interval ?? '1h')

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

type AnyRow = any
type Ohlcv = { t: number; o: number; h: number; l: number; c: number; v: number }

const rows = ref<Ohlcv[]>([])
const pending = ref(false)
const error = ref<unknown>(null)
const effectiveFromSec = ref<number | null>(null)
const effectiveToSec = ref<number | null>(null)

function ensureMs(t: any): number {
  if (t == null) return NaN
  if (typeof t === 'string') {
    const d = Date.parse(t)
    return Number.isFinite(d) ? d : NaN
  }
  const n = Number(t)
  return Number.isFinite(n) ? (n < 1e12 ? n * 1000 : n) : NaN
}
function normalizeRow(row: AnyRow): Ohlcv | null {
  try {
    if (Array.isArray(row)) {
      const [tt, o, h, l, c, v] = row
      const t = ensureMs(tt)
      if (Number.isFinite(t)) return { t, o: +o, h: +h, l: +l, c: +c, v: +(v ?? 0) }
    } else if (row && typeof row === 'object') {
      const tRaw = row.timestamp ?? row.t ?? row.time ?? row.ts ?? row.open_time ?? row.openTime
      const o = row.open ?? row.o ?? row.open_price
      const h = row.high ?? row.h ?? row.high_price
      const l = row.low ?? row.l ?? row.low_price
      const c = row.close ?? row.c ?? row.close_price
      const v = row.volume ?? row.v ?? row.volume_base ?? 0
      const t = ensureMs(tRaw)
      if (Number.isFinite(t)) return { t, o: +o, h: +h, l: +l, c: +c, v: +v }
    }
  } catch {}
  return null
}

async function fetchOHLCV(fromSec: number, toSec: number) {
  const q = new URLSearchParams({
    limit: '1000',
    from: String(fromSec),
    to: String(toSec),
  })
  const url = `${BASE_URL}/api/v1/klines/${symbol.value}/${interval.value}/ohlcv?${q.toString()}`
  const resp = await $fetch<AnyRow[]>(url, { method: 'GET' })
  const mapped = (Array.isArray(resp) ? resp : []).map(normalizeRow).filter(Boolean) as Ohlcv[]
  mapped.sort((a, b) => a.t - b.t)
  return { mapped, url }
}

async function fetchStatsLatestSec(): Promise<number | null> {
  try {
    const url = `${BASE_URL}/api/v1/klines/${symbol.value}/${interval.value}/stats`
    const s = await $fetch<any>(url, { method: 'GET' })
    const end = s?.date_range?.end ?? s?.latest_kline?.close_time
    const ms = typeof end === 'string' ? Date.parse(end) : typeof end === 'number' ? end : NaN
    return Number.isFinite(ms) ? Math.floor((ms < 1e12 ? ms * 1000 : ms) / 1000) : null
  } catch {
    return null
  }
}

async function fetchData() {
  pending.value = true
  error.value = null
  try {
    const toNow = Math.floor(Date.now() / 1000)
    const fromNow = toNow - WINDOW_SEC
    let { mapped } = await fetchOHLCV(fromNow, toNow)

    if (mapped.length === 0) {
      const latestSec = await fetchStatsLatestSec()
      if (latestSec) {
        const from = latestSec - WINDOW_SEC
        const res2 = await fetchOHLCV(from, latestSec)
        mapped = res2.mapped
        if (mapped.length) {
          effectiveFromSec.value = from
          effectiveToSec.value = latestSec
        }
      }
    } else {
      effectiveFromSec.value = fromNow
      effectiveToSec.value = toNow
    }

    rows.value = mapped
  } catch (e) {
    error.value = e
    rows.value = []
  } finally {
    pending.value = false
  }
}
onMounted(fetchData)
watch([symbol, interval], () => {
  void fetchData()
})

const neededCount = computed(() => Math.max(1, Math.ceil(WINDOW_MS / intervalMs[interval.value])))
const displayed = computed(() => {
  const r = rows.value
  if (!r.length) return r
  return r.slice(Math.max(0, r.length - neededCount.value))
})

const candleSeries = computed(() =>
  displayed.value.map((r) => ({ x: new Date(r.t), y: [r.o, r.h, r.l, r.c] })),
)
const volumeSeries = computed(() => displayed.value.map((r) => ({ x: new Date(r.t), y: r.v })))
const series = computed(() => [
  { name: 'Price', type: 'candlestick' as const, data: candleSeries.value },
  { name: 'Volume', type: 'column' as const, data: volumeSeries.value },
])

const lastClose = computed(() => (displayed.value.length ? displayed.value.at(-1)!.c : 0))
const firstOpen = computed(() => (displayed.value.length ? displayed.value[0]!.o : 0))
const pctChange = computed(() =>
  firstOpen.value ? (lastClose.value / firstOpen.value - 1) * 100 : 0,
)

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

const MIN_BARS = 10
const MIN_SPAN_MS = computed(() => Math.max(intervalMs[interval.value] * MIN_BARS, 5 * 60_000))
const MAX_SPAN_MS = WINDOW_MS

function clampZoomSpan(min: number, max: number) {
  let span = max - min
  if (span < MIN_SPAN_MS.value) {
    const mid = (min + max) / 2
    span = MIN_SPAN_MS.value
    min = mid - span / 2
    max = mid + span / 2
  } else if (span > MAX_SPAN_MS) {
    const mid = (min + max) / 2
    span = MAX_SPAN_MS
    min = mid - span / 2
    max = mid + span / 2
  }
  return { min, max }
}

function clampToData(min: number, max: number) {
  const data = displayed.value
  if (!data.length) return { min, max }
  const dataMin = data[0].t
  const dataMax = data.at(-1)!.t
  const span = max - min

  if (min < dataMin) {
    min = dataMin
    max = min + span
  }
  if (max > dataMax) {
    max = dataMax
    min = max - span
  }
  return { min, max }
}

const options = computed(() => ({
  chart: {
    id: 'market-apex-klines',
    background: 'transparent',
    animations: { enabled: true },
    foreColor: '#E5E7EB',
    toolbar: {
      show: true,
      tools: {
        download: false,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
    zoom: { enabled: true, type: 'x', autoScaleYaxis: true },
    events: {
      beforeZoom: (_ctx: any, { xaxis }: { xaxis: { min: number; max: number } }) => {
        if ((!xaxis?.min && xaxis?.min !== 0) || (!xaxis?.max && xaxis?.max !== 0)) return
        let { min, max } = clampZoomSpan(xaxis.min, xaxis.max)
        ;({ min, max } = clampToData(min, max))
        return { xaxis: { min, max } }
      },
      zoomed: (_ctx: any, { xaxis }: { xaxis: { min: number; max: number } }) => {
        if ((!xaxis?.min && xaxis?.min !== 0) || (!xaxis?.max && xaxis?.max !== 0)) return
        let { min, max } = clampZoomSpan(xaxis.min, xaxis.max)
        ;({ min, max } = clampToData(min, max))
        ApexCharts.exec(
          'market-apex-klines',
          'updateOptions',
          { xaxis: { min, max } },
          false,
          false,
        )
      },
      beforeResetZoom: () => {
        const last = displayed.value.at(-1)
        if (!last) return
        const max = last.t
        const min = max - WINDOW_MS
        const { min: m, max: M } = clampToData(min, max)
        ApexCharts.exec(
          'market-apex-klines',
          'updateOptions',
          { xaxis: { min: m, max: M } },
          false,
          false,
        )
        return { xaxis: { min: m, max: M } }
      },
    },
  },

  grid: {
    borderColor: 'rgba(255,255,255,0.06)',
    strokeDashArray: 3,
    padding: { left: 12, right: 12, bottom: 8 },
  },
  theme: { mode: 'dark' as const },
  xaxis: {
    type: 'datetime' as const,
    labels: { datetimeUTC: false, style: { fontSize: '11px' } },
    axisTicks: { show: false },
    datetimeFormatter: {
      year: 'yyyy',
      month: 'MMM yyyy',
      day: 'dd MMM yyyy',
      hour: 'dd MMM yyyy HH:mm',
    },
    range: WINDOW_MS,
  },
  yaxis: [
    {
      seriesName: 'Price',
      tooltip: { enabled: true },
      decimalsInFloat: 2,
      labels: { formatter: (v: number) => formatPrice(v) },
    },
    {
      seriesName: 'Volume',
      opposite: true,
      decimalsInFloat: 0,
      labels: { formatter: (v: number) => formatVolume(v) },
    },
  ],
  stroke: { width: [1.2, 1] },
  plotOptions: {
    candlestick: {
      colors: { upward: '#22c55e', downward: '#ef4444' },
      wick: { useFillColor: true },
    },
    bar: {
      columnWidth: '65%',
      colors: { ranges: [{ from: 0, to: Number.MAX_VALUE, color: 'rgba(148,163,184,0.45)' }] },
    },
  },
  dataLabels: { enabled: false },
  legend: {
    show: true,
    labels: { colors: '#E5E7EB' },
    markers: { radius: 2 },
    itemMargin: { horizontal: 8 },
  },
  tooltip: {
    shared: true,
    x: { show: true, format: 'dd MMM yyyy HH:mm' },
    y: [
      {
        formatter: (v: number, { dataPointIndex, w }: any) => {
          const ohlc = w?.config?.series?.[0]?.data?.[dataPointIndex]?.y
          if (!ohlc) return formatPrice(v)
          const [o, h, l, c] = ohlc
          return `O ${formatPrice(o)}  H ${formatPrice(h)}  L ${formatPrice(l)}  C ${formatPrice(c)}`
        },
        title: { formatter: () => 'Price: ' },
      },
      { formatter: (v: number) => formatVolume(v), title: { formatter: () => 'Volume: ' } },
    ],
  },
  markers: { size: 0 },
  tooltipTheme: 'dark',
  crosshairs: { show: true, width: 1, opacity: 0.2 },
}))

watch([displayed, interval], async () => {
  await nextTick()
  const last = displayed.value.at(-1)
  if (!last) return
  const max = last.t
  const min = Math.max(0, max - WINDOW_MS)
  ApexCharts.exec('market-apex-klines', 'zoomX', min, max)
})
</script>
