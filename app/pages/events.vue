<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-semibold">Crypto Events Calendar</h2>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="event in events"
          :key="event.id"
          class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <div
                  class="px-2 py-1 rounded text-xs font-medium"
                  :class="getEventTypeClass(event.type)"
                >
                  {{ event.type }}
                </div>
                <span class="text-sm text-white/60">{{ formatDate(event.date) }}</span>
              </div>
              <h3 class="font-semibold mb-1">{{ event.title }}</h3>
              <p class="text-sm text-white/70">{{ event.description }}</p>
              <div v-if="event.symbol" class="mt-2 flex items-center gap-2">
                <ui-coin-logo :asset="getBaseAsset(event.symbol)" :size="20" />
                <span class="text-sm text-white/60">{{ event.symbol }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-2xl bg-neutral-900/60 border border-white/5 p-4">
          <h3 class="font-semibold mb-4">Filter by Type</h3>
          <div class="space-y-2">
            <label
              v-for="type in eventTypes"
              :key="type"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                v-model="selectedTypes"
                type="checkbox"
                :value="type"
                class="rounded bg-white/5 border-white/10"
              />
              <span class="text-sm">{{ type }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  title: 'Events',
})

interface Event {
  id: string
  type: 'listing' | 'hardfork' | 'airdrop' | 'upgrade' | 'other'
  title: string
  description: string
  date: number
  symbol?: string
}

const selectedTypes = ref<string[]>(['listing', 'hardfork', 'airdrop', 'upgrade', 'other'])
const eventTypes = ['listing', 'hardfork', 'airdrop', 'upgrade', 'other']

// Mock events - in real app, fetch from API
const allEvents = ref<Event[]>([
  {
    id: '1',
    type: 'listing',
    title: 'New Token Listing on Binance',
    description: 'New cryptocurrency will be listed for trading',
    date: Date.now() + 2 * 24 * 60 * 60 * 1000,
    symbol: 'NEWUSDT',
  },
  {
    id: '2',
    type: 'hardfork',
    title: 'Ethereum Network Upgrade',
    description: 'Major network upgrade scheduled',
    date: Date.now() + 7 * 24 * 60 * 60 * 1000,
    symbol: 'ETHUSDT',
  },
  {
    id: '3',
    type: 'airdrop',
    title: 'Token Airdrop Event',
    description: 'Free tokens distribution to holders',
    date: Date.now() + 14 * 24 * 60 * 60 * 1000,
  },
])

const events = computed(() => {
  return allEvents.value.filter((e) => selectedTypes.value.includes(e.type))
})

function getBaseAsset(symbol: string): string {
  const match = symbol.match(/(USDT|FDUSD|USDC|BUSD|TUSD|USD)$/)
  const quote = match?.[0] ?? ''
  return symbol.slice(0, symbol.length - quote.length)
}

function getEventTypeClass(type: string): string {
  const classes: Record<string, string> = {
    listing: 'bg-blue-500/20 text-blue-400',
    hardfork: 'bg-purple-500/20 text-purple-400',
    airdrop: 'bg-green-500/20 text-green-400',
    upgrade: 'bg-yellow-500/20 text-yellow-400',
    other: 'bg-white/10 text-white/70',
  }
  return classes[type] || classes.other
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
