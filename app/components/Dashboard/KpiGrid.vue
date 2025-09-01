<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <DashboardStatCardLink
      title="Active Pairs"
      :value="totalPairs"
      :loading="pending"
      to="/markets"
      sub="Symbols with 24h stats"
    />
    <DashboardStatCardLink
      title="Total 24h Volume (approx.)"
      :value="'$' + (totalVol || 0).toLocaleString()"
      :loading="pending"
      to="/markets"
      sub="Sum of quoteVolume"
    />
    <DashboardStatCardLink
      title="Average Change (24h)"
      :value="(avgChange || 0).toFixed(2) + '%'"
      :loading="pending"
      to="/markets"
      :sub="avgChange >= 0 ? 'Bullish breadth' : 'Bearish breadth'"
    />
    <DashboardStatCardLink
      title="Movers ≥ 5% (24h)"
      :value="bigMovers"
      :loading="pending"
      to="/markets"
      sub="Up or down"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAll24h } from '~/composables/useAll24h'

const { rows, pending } = useAll24h()

const totalPairs = computed(() => rows.value.length)
const totalVol = computed(() => rows.value.reduce((acc, r) => acc + Number(r.quoteVolume || 0), 0))
const avgChange = computed(() => {
  if (!rows.value.length) return 0
  const sum = rows.value.reduce((a, r) => a + Number(r.priceChangePercent || 0), 0)
  return sum / rows.value.length
})
const bigMovers = computed(
  () => rows.value.filter((r) => Math.abs(Number(r.priceChangePercent)) >= 5).length,
)
</script>
