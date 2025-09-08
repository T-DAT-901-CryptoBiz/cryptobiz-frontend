import { ref, onMounted } from 'vue'

export function useFuturesUniverse() {
  const symbols = ref<string[]>([])
  const pending = ref(true)

  onMounted(async () => {
    try {
      const res = await fetch('https://fapi.binance.com/fapi/v1/exchangeInfo')
      const j = await res.json()
      const list: string[] = (j?.symbols || [])
        .filter((s: any) => s.contractType === 'PERPETUAL' && s.quoteAsset === 'USDT')
        .map((s: any) => s.pair || s.symbol)
      symbols.value = Array.from(new Set(list))
    } catch {
      symbols.value = []
    } finally {
      pending.value = false
    }
  })

  return { symbols, pending }
}
