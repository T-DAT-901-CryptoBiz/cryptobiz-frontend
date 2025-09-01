type Cleanup = () => void

interface WSOptions<TMsg = unknown> {
  onMessage: (msg: TMsg) => void
  onOpen?: () => void
  onClose?: (ev: CloseEvent) => void
  onError?: (ev: Event) => void
}

type MiniTickerMsg = { e: string; E: number; s: string; c: string; P: string }
type KlineEnvelope = { e: 'kline'; E: number; s: string; k: KlineMsg }
type KlineMsg = {
  t: number
  T: number
  i: string
  o: string
  h: string
  l: string
  c: string
  v: string
  x: boolean
}

export function useBinanceWS() {
  const base = useRuntimeConfig().public.binanceWsBase

  const connect = <TMsg = unknown>(path: string, opts: WSOptions<TMsg>): Cleanup => {
    if (import.meta.server) return () => {}

    let ws = new WebSocket(`${base.replace(/\/ws$/, '/ws')}/${path}`)
    let closedByUser = false
    let reconnectTimer: ReturnType<typeof setTimeout>

    const open = () => opts.onOpen?.()

    const message = (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data) as TMsg
        opts.onMessage(parsed)
      } catch {
        // ignore
      }
    }

    const close = (e: CloseEvent) => {
      opts.onClose?.(e)
      if (!closedByUser) {
        reconnectTimer = setTimeout(() => {
          ws = new WebSocket(`${base.replace(/\/ws$/, '/ws')}/${path}`)
          attach()
        }, 1000)
      }
    }

    const error = (e: Event) => opts.onError?.(e)

    const attach = () => {
      ws.addEventListener('open', open)
      ws.addEventListener('message', message)
      ws.addEventListener('close', close)
      ws.addEventListener('error', error)
    }
    attach()

    return () => {
      closedByUser = true
      clearTimeout(reconnectTimer)
      ws.removeEventListener('open', open)
      ws.removeEventListener('message', message)
      ws.removeEventListener('close', close)
      ws.removeEventListener('error', error)
      ws.close()
    }
  }

  const miniTicker = (symbol: string, cb: (data: MiniTickerMsg) => void) =>
    connect<MiniTickerMsg>(`${symbol.toLowerCase()}@miniTicker`, {
      onMessage: (m) => cb(m),
    })

  const kline = (symbol: string, interval: string, cb: (data: KlineMsg) => void) =>
    connect<KlineEnvelope>(`${symbol.toLowerCase()}@kline_${interval}`, {
      onMessage: (m) => cb(m.k),
    })

  return { connect, miniTicker, kline }
}
