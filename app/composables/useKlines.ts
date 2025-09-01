import type { KlineTuple, Interval } from '~/types/binance'

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export function mapKlines(kl: KlineTuple[]): Candle[] {
  return kl.map((k) => ({
    time: Math.floor(k[0] / 1000),
    open: +k[1],
    high: +k[2],
    low: +k[3],
    close: +k[4],
    volume: +k[5],
  }))
}

export function useKlines(symbol: string, interval: Interval = '1h', limit = 500) {
  const { klines } = useBinanceMarket()
  const candles = ref<Candle[]>([])
  const pending = ref(true)

  const load = async () => {
    pending.value = true
    try {
      const r = await klines(symbol, interval, limit)
      const raw = (r.data.value ?? []) as KlineTuple[]
      candles.value = mapKlines(raw)
    } finally {
      pending.value = false
    }
  }

  const refreshMs = ref(15_000)

  onMounted(async () => {
    await load()
    const id = setInterval(load, refreshMs.value)
    onBeforeUnmount(() => clearInterval(id))
  })

  return { candles, pending, refresh: load, refreshMs }
}
