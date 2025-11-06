<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-semibold">Market Sentiment Analysis</h2>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-6">
          <h3 class="text-lg font-semibold mb-4">Fear & Greed Index</h3>
          <div class="flex items-center justify-center h-64">
            <div class="text-center">
              <div class="text-6xl font-bold mb-4" :class="getFearGreedColor(fearGreedIndex)">
                {{ fearGreedIndex }}
              </div>
              <div class="text-xl font-semibold mb-2">{{ getFearGreedLabel(fearGreedIndex) }}</div>
              <div class="w-64 h-4 bg-white/10 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all duration-500"
                  :class="getFearGreedColor(fearGreedIndex)"
                  :style="{ width: `${fearGreedIndex}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-6">
          <h3 class="text-lg font-semibold mb-4">Social Media Sentiment</h3>
          <div class="space-y-4">
            <div
              v-for="asset in topAssets"
              :key="asset.symbol"
              class="flex items-center justify-between p-3 rounded-lg bg-white/5"
            >
              <div class="flex items-center gap-3">
                <ui-coin-logo :asset="getBaseAsset(asset.symbol)" :size="24" />
                <span class="font-medium">{{ getBaseAsset(asset.symbol) }}</span>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-sm">
                  <span class="text-white/60">Mentions:</span>
                  <span class="ml-2 font-semibold">{{ asset.mentions }}</span>
                </div>
                <div
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="
                    asset.sentiment >= 0
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  "
                >
                  {{ asset.sentiment >= 0 ? '+' : '' }}{{ asset.sentiment.toFixed(1) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
          <h3 class="font-semibold mb-4">Market Overview</h3>
          <div class="space-y-3">
            <div>
              <div class="text-sm text-white/70 mb-1">Overall Sentiment</div>
              <div class="text-2xl font-semibold text-green-400">Bullish</div>
            </div>
            <div>
              <div class="text-sm text-white/70 mb-1">Active Discussions</div>
              <div class="text-2xl font-semibold">1,234</div>
            </div>
            <div>
              <div class="text-sm text-white/70 mb-1">Trending Topics</div>
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="topic in trendingTopics"
                  :key="topic"
                  class="px-2 py-1 rounded bg-white/5 text-xs"
                >
                  #{{ topic }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  title: 'Sentiment',
})

interface AssetSentiment {
  symbol: string
  mentions: number
  sentiment: number
}

const fearGreedIndex = ref(65) // Mock data
const topAssets = ref<AssetSentiment[]>([
  { symbol: 'BTCUSDT', mentions: 1234, sentiment: 72.5 },
  { symbol: 'ETHUSDT', mentions: 987, sentiment: 68.3 },
  { symbol: 'SOLUSDT', mentions: 654, sentiment: 45.2 },
  { symbol: 'BNBUSDT', mentions: 432, sentiment: 55.8 },
])
const trendingTopics = ref(['Bitcoin', 'Ethereum', 'DeFi', 'NFT', 'Web3'])

function getBaseAsset(symbol: string): string {
  const match = symbol.match(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/)
  const quote = match?.[0] ?? ''
  return symbol.slice(0, symbol.length - quote.length)
}

function getFearGreedLabel(value: number): string {
  if (value >= 75) return 'Extreme Greed'
  if (value >= 55) return 'Greed'
  if (value >= 45) return 'Neutral'
  if (value >= 25) return 'Fear'
  return 'Extreme Fear'
}

function getFearGreedColor(value: number): string {
  if (value >= 75) return 'text-red-400'
  if (value >= 55) return 'text-yellow-400'
  if (value >= 45) return 'text-white'
  if (value >= 25) return 'text-blue-400'
  return 'text-red-600'
}
</script>
