<template>
  <div class="space-y-8">
    <DashboardKpiGrid />

    <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <DashboardGainers />
      <DashboardLosers />
      <DashboardVolumeLeaders />
      <DashboardVolatility />
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <DashboardDonutQuoteBreakdown class="lg:col-span-2" />
      <DashboardDonutDominance />
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <DashboardDonutBreadth />
      <DashboardWatchlistMini class="lg:col-span-2" />
    </section>

    <DashboardLiquidity />
    <NewsStats />
  </div>
</template>

<script setup lang="ts"></script>
