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
    // Utiliser uniquement WebSocket pour les mises à jour en temps réel
    // Le polling REST toutes les 30s est redondant avec miniTicker
    const stop = miniTicker(symbol, (mt) => {
      if (!data.value) return
      data.value.lastPrice = mt.c
      data.value.priceChangePercent = mt.P
    })
    // Supprimé: polling REST redondant toutes les 30s
    // Les données 24h sont mises à jour via WebSocket en temps réel
    onBeforeUnmount(() => {
      stop()
    })
  })

  return { data, pending, refresh: load }
}
