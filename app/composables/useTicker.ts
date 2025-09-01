import type { Ticker24h } from '~/types/binance'

export function useTicker(symbol: string) {
  const { ticker24h } = useBinanceMarket()
  const { miniTicker } = useBinanceWS()

  const data = ref<Ticker24h | null>(null)
  const pending = ref(true)

  const load = async () => {
    pending.value = true
    const r = await ticker24h(symbol)
    data.value = r.data.value as Ticker24h
    pending.value = false
  }

  onMounted(async () => {
    await load()
    const stop = miniTicker(symbol, (mt) => {
      if (!data.value) return
      data.value.lastPrice = mt.c
      data.value.priceChangePercent = mt.P
    })
    const id = setInterval(load, 30_000)
    onBeforeUnmount(() => {
      stop()
      clearInterval(id)
    })
  })

  return { data, pending, refresh: load }
}
