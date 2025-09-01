import type { ExchangeInfo } from '~/types/binance'

type SymMaps = { base: Record<string, string>; quote: Record<string, string> }

export function useSymbolsUniverse() {
  const { exchangeInfo } = useBinanceMarket()

  const universe = useState<string[]>('mk:universe', () => [])
  const maps = useState<SymMaps>('mk:maps', () => ({ base: {}, quote: {} }))
  const loading = useState<boolean>('mk:universe:loading', () => false)

  const STABLE = new Set(['USDT', 'FDUSD', 'USDC', 'BUSD', 'TUSD', 'USD'])

  const load = async () => {
    if (universe.value.length) return
    loading.value = true

    const r = await exchangeInfo()
    await r.refresh?.()

    const info = r.data.value

    const list: string[] = []
    const base: Record<string, string> = {}
    const quote: Record<string, string> = {}

    const symbols: ExchangeInfo['symbols'] = info?.symbols ?? []

    for (const s of symbols) {
      if (s.status === 'TRADING' && STABLE.has(s.quoteAsset)) {
        list.push(s.symbol)
        base[s.symbol] = s.baseAsset
        quote[s.symbol] = s.quoteAsset
      }
    }

    universe.value = list
    maps.value = { base, quote }
    loading.value = false
  }

  onMounted(load)
  return { universe, maps, loading, refresh: load }
}
