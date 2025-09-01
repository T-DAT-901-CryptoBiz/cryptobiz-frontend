<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Top Gainers</h3>
      <span class="text-xs text-white/50" v-if="!pending"
        >Dernière maj: {{ new Date().toLocaleTimeString() }}</span
      >
    </div>

    <div v-if="pending" class="text-sm text-white/50">Chargement…</div>
    <ul v-else class="flex flex-col">
      <li
        v-for="r in rows"
        :key="r.symbol"
        class="flex items-center justify-between py-2.5 border-t border-white/5 first:border-t-0"
      >
        <div class="flex items-center gap-3">
          <div class="h-6 w-6 rounded-full bg-white/10 grid place-items-center text-[10px]">
            {{ r.symbol.replace('USDT', '') }}
          </div>
          <div>
            <p class="text-sm font-medium">{{ r.symbol }}</p>
            <p class="text-xs text-white/50">${{ Number(r.lastPrice).toLocaleString() }}</p>
          </div>
        </div>
        <span class="text-sm font-semibold text-green-400">
          {{ Number(r.priceChangePercent).toFixed(2) }}%
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'
import { useBinanceMarket } from '~/composables/useBinanceMarket'
import type { Ticker24h } from '~/types/binance'

const props = withDefaults(defineProps<{ symbols?: string[]; limit?: number }>(), {
  symbols: undefined,
  limit: 5,
})

const { universe } = useSymbolsUniverse()
const watchlist = computed(() => (props.symbols?.length ? props.symbols : universe))

const { ticker24h } = useBinanceMarket()
const rows = ref<Ticker24h[]>([])
const pending = ref(true)

const load = async () => {
  pending.value = true
  const all = await Promise.all(watchlist.value.map((sym) => ticker24h(sym)))
  rows.value = all
    .map((r) => r.data.value as Ticker24h)
    .filter(Boolean)
    .sort((a, b) => Number(b.priceChangePercent) - Number(a.priceChangePercent))
    .slice(0, props.limit)
  pending.value = false
}

onMounted(load)
</script>
