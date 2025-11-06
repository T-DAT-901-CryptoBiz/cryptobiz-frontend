import { computed, ref, watchEffect } from 'vue'

export type Interval = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1D' | '1W' | '1M'

export interface OhlcvPoint {
  t: number // ms epoch
  o: number
  h: number
  l: number
  c: number
  v: number
}

export interface FetchParams {
  symbol: string
  interval: Interval
  from?: number // ms epoch
  to?: number // ms epoch
  limit?: number
}

function toMs(ts: number) {
  // si serveur renvoie des secondes -> *1000
  return ts < 1e12 ? ts * 1000 : ts
}

function normalizeRow(row: unknown): OhlcvPoint | null {
  // supporte [t,o,h,l,c,v] (t en s ou ms) OU objets {t,o,h,l,c,v} OU binance-like {open_time, open_price, ...}
  try {
    if (Array.isArray(row)) {
      const [t, o, h, l, c, v] = row
      const tt = toMs(Number(t))
      if (Number.isFinite(tt)) return { t: tt, o: +o, h: +h, l: +l, c: +c, v: +(v ?? 0) }
    } else if (row && typeof row === 'object') {
      const tRaw = row.t ?? row.time ?? row.openTime ?? row.open_time
      const o = row.o ?? row.open ?? row.open_price
      const h = row.h ?? row.high ?? row.high_price
      const l = row.l ?? row.low ?? row.low_price
      const c = row.c ?? row.close ?? row.close_price
      const v = row.v ?? row.volume ?? row.volume_base ?? 0
      let tt: number
      if (typeof tRaw === 'string') {
        tt = Date.parse(tRaw)
      } else {
        tt = toMs(Number(tRaw))
      }
      if (Number.isFinite(tt)) return { t: tt, o: +o, h: +h, l: +l, c: +c, v: +v }
    }
  } catch {
    // Ignore parsing errors
  }
  return null
}

export function useKlinesApi(params: Partial<FetchParams>) {
  const symbol = ref(params.symbol ?? 'BTCUSDT')
  const interval = ref<Interval>(params.interval ?? '1h')
  const from = ref<number | undefined>(params.from)
  const to = ref<number | undefined>(params.to)
  const limit = ref<number | undefined>(params.limit ?? 1000)

  const url = computed(() => {
    const base = `http://127.0.0.1:8004/api/v1/klines/${symbol.value}/${interval.value}/ohlcv`
    const q = new URLSearchParams()
    if (typeof limit.value === 'number') q.set('limit', String(limit.value))
    if (typeof from.value === 'number') q.set('from', String(Math.floor(from.value / 1000))) // ← s
    if (typeof to.value === 'number') q.set('to', String(Math.floor(to.value / 1000))) // ← s
    const qs = q.toString()
    return qs ? `${base}?${qs}` : base
  })

  const data = ref<OhlcvPoint[] | null>(null)
  const pending = ref(false)
  const error = ref<unknown>(null)

  async function refresh() {
    pending.value = true
    error.value = null
    try {
      const raw = await $fetch<unknown[]>(url.value)
      const rows = (raw ?? []).map(normalizeRow).filter(Boolean) as OhlcvPoint[]
      rows.sort((a, b) => a.t - b.t) // ASC obligatoire pour l’axe temps
      data.value = rows
    } catch (e) {
      error.value = e
      data.value = null
    } finally {
      pending.value = false
    }
  }

  watchEffect(() => {
    void refresh()
  })

  return { data, pending, error, symbol, interval, from, to, limit, refresh }
}
