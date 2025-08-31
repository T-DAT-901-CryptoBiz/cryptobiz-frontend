import type { ExchangeInfo, Ticker24h, TickerPrice, KlineTuple, Interval } from '~/types/binance'

type QueryParams = Record<string, string | number | boolean | undefined>

export function useBinanceMarket() {
  const { client } = useBinanceClient()

  const get = async <T, P extends QueryParams = QueryParams>(
    key: string,
    url: string,
    params?: P,
  ) => {
    const q = params
      ? new URLSearchParams(
          Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
            if (v !== undefined && v !== null) acc[k] = String(v)
            return acc
          }, {}),
        ).toString()
      : ''

    const cacheKey = q ? `${key}:${q}` : key

    const state = await useAsyncData<T>(cacheKey, () => client<T>(url, { params }), {
      server: false,
      lazy: false,
      immediate: true,
      dedupe: 'defer',
    })

    if (state.error.value) throw createError(state.error.value)
    return state
  }

  const exchangeInfo = async () => get<ExchangeInfo>('binance:exchangeInfo', '/api/v3/exchangeInfo')

  const tickerPrice = async (symbol?: string) =>
    get<TickerPrice | TickerPrice[]>(
      'binance:tickerPrice',
      '/api/v3/ticker/price',
      symbol ? { symbol } : undefined,
    )

  const ticker24h = async (symbol?: string) =>
    get<Ticker24h | Ticker24h[]>(
      'binance:ticker24h',
      '/api/v3/ticker/24hr',
      symbol ? { symbol } : undefined,
    )

  const klines = async (
    symbol: string,
    interval: Interval = '1h',
    limit = 500,
    startTime?: number,
    endTime?: number,
  ) =>
    get<KlineTuple[]>('binance:klines', '/api/v3/klines', {
      symbol,
      interval,
      limit,
      startTime,
      endTime,
    })

  const orderBook = async (symbol: string, limit: 5 | 10 | 20 | 50 | 100 | 500 | 1000 = 50) =>
    get<{ lastUpdateId: number; bids: [string, string][]; asks: [string, string][] }>(
      'binance:depth',
      '/api/v3/depth',
      { symbol, limit },
    )

  type Trade = {
    id: number
    price: string
    qty: string
    quoteQty: string
    time: number
    isBuyerMaker: boolean
    isBestMatch: boolean
  }

  const recentTrades = async (symbol: string, limit = 50) =>
    get<Trade[]>('binance:trades', '/api/v3/trades', { symbol, limit })

  return { exchangeInfo, tickerPrice, ticker24h, klines, orderBook, recentTrades }
}
