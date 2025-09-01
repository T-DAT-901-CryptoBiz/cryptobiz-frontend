<template>
  <div class="rounded-2xl bg-neutral-900/60 border border-white/5 overflow-hidden">
    <div class="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <h3 class="font-semibold">Trading Pairs ({{ base }})</h3>
      <div class="text-xs text-white/50">Top by 24h volume</div>
    </div>

    <div class="max-h-96 overflow-auto">
      <table class="min-w-full text-sm">
        <thead class="text-white/60">
          <tr class="[&>th]:px-4 [&>th]:py-3 text-left">
            <th>Pair</th>
            <th>Price</th>
            <th>24h %</th>
            <th>24h Quote Vol</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="pending" class="border-t border-white/5">
            <td colspan="4" class="px-4 py-6">
              <div class="h-8 rounded bg-white/10 animate-pulse"></div>
            </td>
          </tr>

          <tr v-for="r in top" :key="r.symbol" class="border-t border-white/5 hover:bg-white/5">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <ui-coin-logo :asset="base" :size="18" />
                <NuxtLink :to="`/asset/${r.symbol}`" class="font-medium hover:underline"
                  >{{ r.symbol }}
                </NuxtLink>
              </div>
            </td>
            <td class="px-4 py-3 tabular-nums">${{ Number(r.lastPrice).toLocaleString() }}</td>
            <td class="px-4 py-3">
              <span :class="Number(r.priceChangePercent) >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ Number(r.priceChangePercent).toFixed(2) }}%
              </span>
            </td>
            <td class="px-4 py-3 tabular-nums">
              ${{ Math.round(Number(r.quoteVolume)).toLocaleString() }}
            </td>
          </tr>

          <tr v-if="!pending && !top.length">
            <td colspan="4" class="px-4 py-6 text-center text-white/60">No pairs found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAll24h } from '~/composables/useAll24h'
import { useSymbolsUniverse } from '~/composables/useSymbolsUniverse'

const props = defineProps<{ base: string }>()

const STABLE = new Set(['USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD'])
const { rows, pending } = useAll24h()
const { maps } = useSymbolsUniverse()

const filtered = computed(() =>
  rows.value.filter(
    (r) => maps.value.base[r.symbol] === props.base && STABLE.has(maps.value.quote[r.symbol]),
  ),
)
const top = computed(() =>
  [...filtered.value]
    .sort((a, b) => Number(b.quoteVolume || 0) - Number(a.quoteVolume || 0))
    .slice(0, 20),
)
</script>
