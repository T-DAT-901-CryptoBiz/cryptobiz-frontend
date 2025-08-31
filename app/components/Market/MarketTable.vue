<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">All Crypto</h3>
      <button class="text-xs px-2 py-1 rounded-lg bg-white/5" @click="load">Refresh</button>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-sm">
        <thead class="text-white/60">
          <tr class="[&>th]:px-4 [&>th]:py-3 text-left">
            <th>#</th>
            <th>Asset</th>
            <th>Price</th>
            <th>24h %</th>
            <th>24h Volume</th>
            <th>7d</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="px-4 py-6 text-center text-white/50">Chargement…</td>
          </tr>
          <tr
            v-for="(r, i) in data"
            :key="r.symbol"
            class="border-t border-white/5 hover:bg-white/5"
          >
            <td class="px-4 py-3">{{ i + 1 }}</td>
            <td class="px-4 py-3 font-medium">{{ r.symbol }}</td>
            <td class="px-4 py-3 tabular-nums">${{ r.price.toLocaleString() }}</td>
            <td class="px-4 py-3">
              <span :class="r.ch24h >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ r.ch24h.toFixed(2) }}%
              </span>
            </td>
            <td class="px-4 py-3">${{ r.volume.toLocaleString() }}</td>
            <td class="px-4 py-3">
              <ChartsSparkline
                :points="r.spark"
                :positive="r.spark.at(-1)! >= r.spark[0]"
                :width="140"
                :height="34"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Interval } from '~/types/binance'

const props = withDefaults(
  defineProps<{
    symbols?: string[]
    rows?: number
    interval?: Interval
  }>(),
  {
    symbols: undefined,
    rows: 10,
    interval: '1h',
  },
)

const { universe } = useSymbolsUniverse()
const list = computed(() => (props.symbols?.length ? props.symbols : universe).slice(0, props.rows))

const { ticker24h } = useBinanceMarket()

type Row = {
  symbol: string
  price: number
  ch1h?: number
  ch24h: number
  volume: number
  spark: number[]
}

const loading = ref(true)
const data = ref<Row[]>([])

const fetchRow = async (sym: string): Promise<Row> => {
  const t = await ticker24h(sym)
  const r = t.data.value as any
  const { candles, refresh } = useKlines(sym, props.interval, 7 * 24)
  await refresh()
  return {
    symbol: sym,
    price: Number(r?.lastPrice ?? 0),
    ch24h: Number(r?.priceChangePercent ?? 0),
    volume: Number(r?.quoteVolume ?? 0),
    spark: candles.value.map((c) => c.close),
  }
}

const load = async () => {
  loading.value = true
  const rows = await Promise.all(list.value.map(fetchRow))
  data.value = rows
  loading.value = false
}

onMounted(load)
</script>
