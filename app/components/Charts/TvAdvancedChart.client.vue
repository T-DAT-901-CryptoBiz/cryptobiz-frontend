<template>
  <div
    :id="id"
    class="w-full rounded-2xl overflow-hidden border border-white/5"
    :style="{ height: height + 'px' }"
    role="img"
    aria-label="TradingView advanced chart"
  />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch } from 'vue'

type TVTheme = 'light' | 'dark'

interface TVWidgetOptions {
  symbol: string
  interval?: string
  container_id: string
  autosize?: boolean
  timezone?: string
  theme?: TVTheme
  style?: '1' | '2' | '3' | '4'
  locale?: string
  hide_top_toolbar?: boolean
  allow_symbol_change?: boolean
  studies?: string[]
}

interface TradingViewNS {
  widget: new (opts: TVWidgetOptions) => unknown
}

const props = withDefaults(
  defineProps<{
    symbol: string
    interval?: string
    theme?: TVTheme
    height?: number
    locale?: string
    allowSymbolChange?: boolean
    hideTopToolbar?: boolean
    style?: '1' | '2' | '3' | '4'
    studies?: string[]
    timezone?: string
  }>(),
  {
    interval: '60',
    theme: 'dark',
    height: 480,
    locale: 'en',
    allowSymbolChange: false,
    hideTopToolbar: false,
    style: '1',
    studies: () => [],
    timezone: 'Etc/UTC',
  },
)

const id = `tv_${Math.random().toString(36).slice(2)}`

function getTradingView(): TradingViewNS | null {
  const tv = (globalThis as unknown as { TradingView?: unknown }).TradingView
  if (tv && typeof (tv as { widget?: unknown }).widget === 'function') {
    return tv as TradingViewNS
  }
  return null
}

let tvLoader: Promise<void> | null = null
function loadTradingView(): Promise<void> {
  if (tvLoader) return tvLoader
  tvLoader = new Promise((resolve, reject) => {
    if (getTradingView() || !globalThis.document) {
      resolve()
      return
    }
    const d = globalThis.document
    const s = d.createElement('script')
    s.src = 'https://s3.tradingview.com/tv.js'
    s.async = true
    s.onload = () => resolve()
    s.onerror = (e) => reject(e)
    d.head?.appendChild(s)
  })
  return tvLoader
}

function createWidget() {
  const d = globalThis.document
  if (!d) return

  const el = d.getElementById(id)
  const TV = getTradingView()
  if (!el || !TV) return

  el.innerHTML = ''

  new TV.widget({
    symbol: props.symbol,
    interval: props.interval,
    container_id: id,
    autosize: true,
    timezone: props.timezone,
    theme: props.theme,
    style: props.style,
    locale: props.locale,
    hide_top_toolbar: props.hideTopToolbar,
    allow_symbol_change: props.allowSymbolChange,
    studies: props.studies,
  })
}

async function mountOrRemount() {
  await loadTradingView()
  createWidget()
}

onMounted(() => {
  mountOrRemount()
})

watch(
  () => [props.symbol, props.interval, props.theme, props.style, props.locale, props.timezone],
  () => {
    createWidget()
  },
)

onBeforeUnmount(() => {
  const d = globalThis.document
  if (!d) return
  const el = d.getElementById(id)
  if (el) el.innerHTML = ''
})
</script>
