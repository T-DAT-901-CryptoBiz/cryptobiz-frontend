import { ref, onMounted } from 'vue'

export function useFuturesUniverse() {
  const config = useRuntimeConfig()
  const binanceFuturesRestBase = config.public?.binanceFuturesRestBase || 'https://fapi.binance.com'

  const symbols = ref<string[]>([])
  const pending = ref(true)

  onMounted(async () => {
    try {
      const res = await fetch(`${binanceFuturesRestBase}/fapi/v1/exchangeInfo`)
      const j = (await res.json()) as {
        symbols?: Array<{
          contractType?: string
          quoteAsset?: string
          pair?: string
          symbol?: string
        }>
      }
      const list: string[] = (j?.symbols || [])
        .filter((s) => s.contractType === 'PERPETUAL' && s.quoteAsset === 'USDT')
        .map((s) => s.pair || s.symbol || '')
        .filter(Boolean)
      symbols.value = Array.from(new Set(list))
    } catch {
      symbols.value = []
    } finally {
      pending.value = false
    }
  })

  return { symbols, pending }
}
