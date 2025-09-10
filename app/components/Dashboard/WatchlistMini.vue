<template>
  <div class="rounded-2xl bg-neutral-900/60 p-4 border border-white/5">
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold">Your Watchlist</h3>

      <div class="flex items-center gap-3">
        <span v-if="total > 0" class="text-xs text-white/50">{{ total }} total</span>
        <NuxtLink to="/watchlist" class="text-xs text-white/60 hover:text-white/90">
          Manage
        </NuxtLink>
      </div>
    </div>

    <div v-if="!list.length" class="text-sm text-white/60">Add some pairs from Markets.</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div v-for="s in visible" :key="s">
        <MarketTickerCard :symbol="s" />
      </div>

      <NuxtLink
        v-if="extra > 0"
        to="/watchlist"
        class="rounded-xl border border-dashed border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
      >
        <div class="h-full min-h-[92px] grid place-items-center text-center">
          <div class="text-sm font-medium">
            View {{ extra }} more
            <Icon name="lucide:arrow-right" class="inline-block ml-1 h-4 w-4 align-[-2px]" />
          </div>
          <div class="text-xs text-white/60 mt-1">Go to your full watchlist</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'

const STORAGE_KEY = 'favoritesSymbols'
const MAX_SHOW = 4

const list = ref<string[]>([])

function loadFromStorage() {
  if (import.meta.server) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]'
    const arr = JSON.parse(raw)
    list.value = Array.isArray(arr)
      ? Array.from(new Set(arr.filter((x: unknown) => typeof x === 'string' && String(x).trim())))
      : []
  } catch {
    list.value = []
  }
}

function onStorage(e: StorageEvent) {
  if (e.key === STORAGE_KEY) loadFromStorage()
}
function onVisibility() {
  if (!document.hidden) loadFromStorage()
}

onMounted(() => {
  loadFromStorage()
  window.addEventListener('storage', onStorage)
  document.addEventListener('visibilitychange', onVisibility)
})
onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorage)
  document.removeEventListener('visibilitychange', onVisibility)
})

const total = computed(() => list.value.length)
const visible = computed(() => list.value.slice(0, MAX_SHOW))
const extra = computed(() => Math.max(0, list.value.length - MAX_SHOW))
</script>
