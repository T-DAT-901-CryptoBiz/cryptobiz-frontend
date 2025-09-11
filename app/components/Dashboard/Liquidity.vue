<template>
  <section class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <!-- Header -->
    <header class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Liquidity Snapshot — 24h Avg</h3>

      <div class="flex items-center gap-2 text-xs">
        <span v-if="lastUpdated" class="text-white/50">
          Samples {{ totalSamples }} · Updated {{ timeAgo(lastUpdated) }}
        </span>

        <button
          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 ring-1 ring-white/10 transition"
          :disabled="loading"
          @click="sampleNow"
        >
          <svg
            v-if="loading"
            class="h-3.5 w-3.5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              class="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" stroke-width="4" />
          </svg>
          <span>Refresh</span>
        </button>

        <button
          class="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition"
          @click="resetHistory"
        >
          Reset
        </button>
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
              class="text-[10px] px-2 py-0.5 rounded-full bg-white/10 ring-1 ring-white/10 text-white/60"
            >
              24h avg
            </span>
          </div>

          <span
            class="text-[10px] px-2 py-1 rounded-full font-semibold"
            :class="spreadBadgeClass(r.spread)"
            :title="`Avg spread over 24h`"
          >
            Spread {{ r.spread.toFixed(3) }}%
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
            title="Bids (24h avg)"
          />
          <div
            class="h-full"
            :style="{
              width: (r.askShare * 100).toFixed(2) + '%',
              background: 'linear-gradient(90deg,#ef4444,#b91c1c)',
            }"
            title="Asks (24h avg)"
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

/** === Props === */
const props = withDefaults(
  defineProps<{
    symbols?: string[]
    depth?: number
    sampleEveryMs?: number // fréquence d’échantillonnage
  }>(),
  {
    symbols: () => ['BTCUSDT', 'ETHUSDT'],
    depth: 50,
    sampleEveryMs: 5 * 60 * 1000, // 5 min
  },
)

const { orderBook } = useBinanceMarket()

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
  if (import.meta.server) return
  try {
    localStorage.setItem(LS_KEY(sym), JSON.stringify(arr))
  } catch {}
}

/** === Fetch one snapshot (instantané) === */
async function snapshot(sym: string): Promise<Sample | null> {
  const r = await orderBook(sym, props.depth)
  const ob = r.data.value
  if (!ob) return null
  const bids = ob.bids.reduce((a: number, [p, q]: [string, string]) => a + Number(p) * Number(q), 0)
  const asks = ob.asks.reduce((a: number, [p, q]: [string, string]) => a + Number(p) * Number(q), 0)
  const bestBid = Number(ob.bids[0]?.[0] || 0)
  const bestAsk = Number(ob.asks[0]?.[0] || 0)
  const spread = bestAsk && bestBid ? ((bestAsk - bestBid) / bestAsk) * 100 : 0
  return { t: Date.now(), bids, asks, spread }
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
      })
    } catch {
      // skip symbol on error
    }
  }

  rows.value = out
  lastUpdated.value = Date.now()
  loading.value = false
}

/** === Timer (peu fréquent) === */
let timer: number | null = null
const start = () => {
  stop()
  if ((props.sampleEveryMs ?? 0) > 0) {
    timer = window.setInterval(sampleNow, props.sampleEveryMs!) as unknown as number
  }
}
const stop = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

/** === Reset history === */
function resetHistory() {
  if (import.meta.server) return
  for (const s of props.symbols) {
    try {
      localStorage.removeItem(LS_KEY(s))
    } catch {}
  }
  sampleNow()
}

/** === Lifecycle === */
onMounted(() => {
  sampleNow() // première moyenne (utilisera l’historique si présent)
  start() // échantillonnage (par défaut toutes les 5 min)
})
onBeforeUnmount(stop)
watch(
  () => [props.symbols, props.depth],
  () => sampleNow(),
)
</script>
