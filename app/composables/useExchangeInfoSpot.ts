import { ref, onMounted, computed } from 'vue'

type SpotSymbolMeta = {
  symbol: string
  baseAsset?: string
  quoteAsset?: string
  onboardDate?: number | null
}

type ExchangeInfo = {
  symbols?: Array<Partial<SpotSymbolMeta> & Record<string, unknown>>
}

export function useExchangeInfoSpot() {
  const meta = ref<SpotSymbolMeta[]>([])
  const pending = ref<boolean>(true)

  const load = async () => {
    pending.value = true
    try {
      const res = await fetch('https://api.binance.com/api/v3/exchangeInfo')
      if (!res.ok) throw new Error('exchangeInfo fail')
      const j = (await res.json()) as ExchangeInfo
      const arr = (j.symbols ?? []).map((s) => ({
        symbol: String(s.symbol || ''),
        baseAsset: (s as any).baseAsset,
        quoteAsset: (s as any).quoteAsset,
        onboardDate: typeof (s as any).onboardDate === 'number' ? (s as any).onboardDate : null,
      }))
      meta.value = arr
    } catch {
      meta.value = []
    } finally {
      pending.value = false
    }
  }

  onMounted(load)

  const metaBySymbol = computed(() => {
    const m = new Map<string, SpotSymbolMeta>()
    for (const s of meta.value) m.set(s.symbol, s)
    return m
  })

  return { meta, metaBySymbol, pending, refresh: load }
}
