export type Interval =
  | '1s'
  | '1m'
  | '3m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '2h'
  | '4h'
  | '6h'
  | '8h'
  | '12h'
  | '1d'
  | '3d'
  | '1w'
  | '1M'

export interface TickerPrice {
  symbol: string
  price: string
}
export interface Ticker24h {
  symbol: string
  priceChangePercent: string
  lastPrice: string
  volume: string
  quoteVolume: string
  highPrice: string
  lowPrice: string
  count: number
}
export type KlineTuple = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
]

export interface ExchangeSymbol {
  symbol: string
  status: string
  baseAsset: string
  quoteAsset: string
}
export interface ExchangeInfo {
  symbols: ExchangeSymbol[]
}
