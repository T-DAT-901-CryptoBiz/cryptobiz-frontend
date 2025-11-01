<template>
  <section class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <!-- Header -->
    <header class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Liquidity Snapshot — Real-time</h3>

      <div class="flex items-center gap-2 text-xs">
        <span v-if="lastUpdated" class="text-white/50 flex items-center gap-1">
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live · Updated {{ timeAgo(lastUpdated) }}
        </span>
        <span v-if="totalSamples > 0" class="text-white/50">
          · Samples (24h): {{ totalSamples }}
        </span>
      </div>
    </header>

    <!-- Skeleton -->
    <div v-if="loading && !rows.length" class="space-y-2">
      <UiSkeletonLine v-for="i in 2" :key="i" class="h-16" />
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 gap-3">
      <article
        v-for="r in rows"
        :key="r.symbol"
        class="rounded-xl bg-white/5 p-3 ring-1 ring-white/10"
      >
        <!-- Top row -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <ui-coin-logo :asset="base(r.symbol)" :size="22" />
            <NuxtLink :to="`/asset/${r.symbol}`" class="font-medium truncate hover:underline">
              {{ r.symbol }}
            </NuxtLink>
            <span
              class="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 ring-1 ring-green-500/30 text-green-300"
            >
              Live
            </span>
          </div>

          <span
            class="text-[10px] px-2 py-1 rounded-full font-semibold"
            :class="spreadBadgeClass(r.spread)"
            :title="`Avg spread over 24h`"
          >
            Spread {{ r.spread.toFixed(3) }}%
            <span class="ml-1" v-if="r.isRealtime">●</span>
          </span>
        </div>

        <!-- Stacked bar -->
        <div
          class="mt-3 h-2.5 w-full rounded-full bg-white/10 overflow-hidden"
          role="img"
          :aria-label="`Bids ${Math.round(r.bidShare * 100)}%, Asks ${Math.round(r.askShare * 100)}%`"
        >
          <div
            class="h-full"
            :style="{
              width: (r.bidShare * 100).toFixed(2) + '%',
              background: 'linear-gradient(90deg,#22c55e,#16a34a)',
            }"
            title="Bids (real-time)"
          />
          <div
            class="h-full"
            :style="{
              width: (r.askShare * 100).toFixed(2) + '%',
              background: 'linear-gradient(90deg,#ef4444,#b91c1c)',
            }"
            title="Asks (real-time)"
          />
        </div>

        <!-- Numbers -->
        <div class="mt-2 grid grid-cols-2 gap-3 text-xs tabular-nums">
          <div>
            <div class="text-white/60 flex items-center gap-1">
              <span class="inline-block h-2 w-2 rounded-full" style="background: #22c55e"></span>
              Bids (est. USD)
            </div>
            <div class="font-medium">
              ${{ fmtMoney(r.bids) }}
              <span class="text-white/50">· {{ Math.round(r.bidShare * 100) }}%</span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-white/60 flex items-center justify-end gap-1">
              <span class="inline-block h-2 w-2 rounded-full" style="background: #ef4444"></span>
              Asks (est. USD)
            </div>
            <div class="font-medium">
              ${{ fmtMoney(r.asks) }}
              <span class="text-white/50">· {{ Math.round(r.askShare * 100) }}%</span>
            </div>
          </div>
        </div>

        <div class="mt-1 text-[11px] text-white/50">Samples (24h): {{ r.samples }}</div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import { useBinanceWS } from '~/composables/useBinanceWS'

/** === Props === */
const props = withDefaults(
  defineProps<{
    symbols?: string[]
    depth?: number
    sampleEveryMs?: number // fréquence d'échantillonnage pour la moyenne 24h
  }>(),
  {
    symbols: () => ['BTCUSDT', 'ETHUSDT'],
    depth: 50,
    sampleEveryMs: 5 * 60 * 1000, // 5 min
  },
)

const { orderBook } = useBinanceMarket()
const { connect } = useBinanceWS()

/** === Types === */
type Sample = { t: number; bids: number; asks: number; spread: number }
type Row = {
  symbol: string
  bids: number
  asks: number
  spread: number
  bidShare: number
  askShare: number
  samples: number
  isRealtime: boolean
}

/** === State === */
const rows = ref<Row[]>([])
const loading = ref(true)
const lastUpdated = ref<number | null>(null)
const totalSamples = computed(() => rows.value.reduce((a, r) => a + r.samples, 0))

/** === Constants === */
const WINDOW_MS = 24 * 60 * 60 * 1000
const LS_KEY = (sym: string) => `liq:hist:v1:${sym}`

/** === Utils === */
const base = (sym: string) => sym.replace(/(USDT|FDUSD|USDC|BUSD|TUSD|USD|BTC|ETH|BNB)$/, '')
const fmtMoney = (n: number) =>
  new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)

function spreadBadgeClass(p: number) {
  if (p <= 0.05) return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20'
  if (p <= 0.2) return 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20'
  return 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20'
}

function timeAgo(ts: number) {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

/** === History helpers (localStorage) === */
function loadHistory(sym: string): Sample[] {
  if (import.meta.server) return []
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(LS_KEY(sym)) || '[]'
    const arr = JSON.parse(raw) as Sample[]
    const cutoff = Date.now() - WINDOW_MS
    return arr.filter((s) => s && typeof s.t === 'number' && s.t >= cutoff)
  } catch {
    return []
  }
}
function saveHistory(sym: string, arr: Sample[]) {
  if (import.meta.server || !import.meta.client) return
  try {
    localStorage.setItem(LS_KEY(sym), JSON.stringify(arr))
  } catch {
    // Ignore storage errors
  }
}

/** === Fetch one snapshot (instantané) === */
function calculateLiquidity(
  bids: [string, string][],
  asks: [string, string][],
): {
  bids: number
  asks: number
  spread: number
} {
  const bidsUsd = bids.reduce((a: number, [p, q]: [string, string]) => a + Number(p) * Number(q), 0)
  const asksUsd = asks.reduce((a: number, [p, q]: [string, string]) => a + Number(p) * Number(q), 0)
  const bestBid = Number(bids[0]?.[0] || 0)
  const bestAsk = Number(asks[0]?.[0] || 0)
  const spread = bestAsk && bestBid ? ((bestAsk - bestBid) / bestAsk) * 100 : 0
  return { bids: bidsUsd, asks: asksUsd, spread }
}

async function snapshot(sym: string): Promise<Sample | null> {
  const r = await orderBook(sym, props.depth)
  const ob = r.data.value
  if (!ob) return null
  const { bids, asks, spread } = calculateLiquidity(ob.bids, ob.asks)
  return { t: Date.now(), bids, asks, spread }
}

/** === Update row with real-time data === */
function updateRowRealtime(sym: string, bids: [string, string][], asks: [string, string][]) {
  const { bids: bidsUsd, asks: asksUsd, spread } = calculateLiquidity(bids, asks)
  const index = rows.value.findIndex((r) => r.symbol === sym)

  // Si la row n'existe pas encore, l'ajouter
  if (index === -1) {
    const total = Math.max(1e-9, bidsUsd + asksUsd)
    const hist = loadHistory(sym)
    rows.value.push({
      symbol: sym,
      bids: bidsUsd,
      asks: asksUsd,
      spread,
      bidShare: bidsUsd / total,
      askShare: asksUsd / total,
      samples: hist.length,
      isRealtime: true,
    })
    lastUpdated.value = Date.now()
    loading.value = false
    return
  }

  const total = Math.max(1e-9, bidsUsd + asksUsd)
  rows.value[index] = {
    ...rows.value[index],
    bids: bidsUsd,
    asks: asksUsd,
    spread,
    bidShare: bidsUsd / total,
    askShare: asksUsd / total,
    isRealtime: true,
  }
  lastUpdated.value = Date.now()
}

/** === One sampling cycle (append + avg 24h) === */
async function sampleNow() {
  loading.value = true

  const out: Row[] = []
  for (const s of props.symbols) {
    try {
      // 1) charger + purger l'historique
      const hist = loadHistory(s)

      // 2) faire un nouvel échantillon
      const snap = await snapshot(s)
      if (snap) hist.push(snap)

      // 3) re-purger au cas où et limiter la taille (environ ~ 24h / 5 min = 288)
      const cutoff = Date.now() - WINDOW_MS
      const pruned = hist.filter((x) => x.t >= cutoff)
      if (pruned.length > 350) pruned.splice(0, pruned.length - 350)
      saveHistory(s, pruned)

      // 4) calcul des moyennes 24h (fallback sur instantané si 0 sample)
      const arr = pruned.length ? pruned : snap ? [snap] : []
      const sum = arr.reduce(
        (a, x) => {
          a.b += x.bids
          a.a += x.asks
          a.s += x.spread
          return a
        },
        { b: 0, a: 0, s: 0 },
      )
      const n = Math.max(1, arr.length)
      const bids = sum.b / n
      const asks = sum.a / n
      const total = Math.max(1e-9, bids + asks)

      out.push({
        symbol: s,
        bids,
        asks,
        spread: sum.s / n,
        bidShare: bids / total,
        askShare: asks / total,
        samples: pruned.length,
        isRealtime: false,
      })
    } catch {
      // skip symbol on error
    }
  }

  rows.value = out
  lastUpdated.value = Date.now()
  loading.value = false
}

/** === WebSocket connections === */
type DepthPartialMsg = {
  lastUpdateId: number
  bids: [string, string][]
  asks: [string, string][]
}

function isDepthPartialMsg(x: unknown): x is DepthPartialMsg {
  if (!x || typeof x !== 'object') return false
  const v = x as Record<string, unknown>
  return Array.isArray(v.bids) && Array.isArray(v.asks) && typeof v.lastUpdateId === 'number'
}

let wsCleanups: Array<() => void> = []

function openWebSockets() {
  if (import.meta.server) return
  // Fermer les connexions existantes
  wsCleanups.forEach((cleanup) => cleanup())
  wsCleanups = []

  // Ouvrir une connexion WebSocket pour chaque symbole
  for (const sym of props.symbols) {
    const canPartial = props.depth === 5 || props.depth === 10 || props.depth === 20
    const path = canPartial
      ? `${sym.toLowerCase()}@depth${props.depth}@100ms`
      : `${sym.toLowerCase()}@depth@100ms`

    // Dernier échantillon sauvegardé pour éviter de surcharger l'historique
    let lastSampleTime = 0
    const SAMPLE_INTERVAL = 60 * 1000 // Sauvegarder toutes les minutes

    const cleanup = connect(path, {
      onMessage: (msg: unknown) => {
        if (!isDepthPartialMsg(msg)) return
        const now = Date.now()

        // Utiliser les données directement pour la version temps réel (toujours)
        updateRowRealtime(sym, msg.bids, msg.asks)

        // Ajouter à l'historique seulement périodiquement (pour ne pas surcharger)
        if (now - lastSampleTime >= SAMPLE_INTERVAL) {
          const { bids, asks, spread } = calculateLiquidity(msg.bids, msg.asks)
          const sample: Sample = { t: now, bids, asks, spread }
          const hist = loadHistory(sym)
          hist.push(sample)
          const cutoff = now - WINDOW_MS
          const pruned = hist.filter((x) => x.t >= cutoff)
          if (pruned.length > 350) pruned.splice(0, pruned.length - 350)
          saveHistory(sym, pruned)
          lastSampleTime = now

          // Mettre à jour le nombre de samples dans la row
          const index = rows.value.findIndex((r) => r.symbol === sym)
          if (index !== -1) {
            rows.value[index].samples = pruned.length
          }
        }
      },
    })
    wsCleanups.push(cleanup)
  }
}

/** === Timer (peu fréquent) pour l'historique === */
let timer: ReturnType<typeof setInterval> | null = null
const start = () => {
  stop()
  if ((props.sampleEveryMs ?? 0) > 0 && import.meta.client) {
    timer = setInterval(() => {
      // Mettre à jour le nombre de samples en arrière-plan
      for (const s of props.symbols) {
        const hist = loadHistory(s)
        const index = rows.value.findIndex((r) => r.symbol === s)
        if (index !== -1) {
          rows.value[index].samples = hist.length
        }
      }
    }, props.sampleEveryMs!)
  }
}
const stop = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

/** === Lifecycle === */
onMounted(() => {
  sampleNow() // première moyenne (utilisera l'historique si présent)
  openWebSockets() // démarrer les WebSockets pour le temps réel
  start() // échantillonnage en arrière-plan pour l'historique
})
onBeforeUnmount(() => {
  stop()
  wsCleanups.forEach((cleanup) => cleanup())
  wsCleanups = []
})
watch(
  () => [props.symbols, props.depth],
  () => {
    sampleNow()
    openWebSockets()
  },
)
</script>
