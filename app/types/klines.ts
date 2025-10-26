export type Interval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M'

export interface OhlcvPoint {
  t: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

export interface FetchKlinesParams {
  symbol: string
  interval: Interval
  from?: number
  to?: number
  limit?: number
}
