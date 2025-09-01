<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Liquidity Snapshot (Top 50 levels)</h3>
      <button class="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20" @click="load">
        Refresh
      </button>
    </div>

    <div v-if="loading" class="space-y-2">
      <UiSkeletonLine class="h-5" v-for="i in 2" :key="i" />
    </div>

    <div v-else class="space-y-2">
      <div v-for="r in rows" :key="r.symbol" class="p-3 rounded-xl bg-white/5">
        <div class="flex items-center justify-between text-sm">
          <NuxtLink :to="`/asset/${r.symbol}`" class="font-medium hover:underline"
            >{{ r.symbol }}
          </NuxtLink>
          <span class="text-white/60">Spread: {{ r.spread.toFixed(3) }}%</span>
        </div>
        <div class="mt-2 grid grid-cols-2 gap-3 text-xs tabular-nums">
          <div>
            <div class="text-green-400">Bids (USD est.)</div>
            <div>${{ Math.round(r.bids).toLocaleString() }}</div>
          </div>
          <div class="text-right">
            <div class="text-red-400">Asks (USD est.)</div>
            <div>${{ Math.round(r.asks).toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useBinanceMarket } from '~/composables/useBinanceMarket'

const symbols = ['BTCUSDT', 'ETHUSDT']
const { orderBook } = useBinanceMarket()

type Row = { symbol: string; bids: number; asks: number; spread: number }
const rows = ref<Row[]>([])
const loading = ref(true)

const load = async () => {
  loading.value = true
  const out: Row[] = []
  for (const s of symbols) {
    const r = await orderBook(s, 50)
    const ob = r.data.value
    if (!ob) continue
    const bids = ob.bids.reduce((a, [p, q]) => a + Number(p) * Number(q), 0)
    const asks = ob.asks.reduce((a, [p, q]) => a + Number(p) * Number(q), 0)
    const bestBid = Number(ob.bids[0]?.[0] || 0)
    const bestAsk = Number(ob.asks[0]?.[0] || 0)
    out.push({
      symbol: s,
      bids,
      asks,
      spread: bestAsk && bestBid ? ((bestAsk - bestBid) / bestAsk) * 100 : 0,
    })
  }
  rows.value = out
  loading.value = false
}

onMounted(load)
</script>
