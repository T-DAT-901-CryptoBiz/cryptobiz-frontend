import { defineNuxtPlugin } from 'nuxt/app' // ← préfère 'nuxt/app' (évite certains soucis)
import { useToast } from '~/composables/useToast'
import { useAlertsCenter } from '~/composables/useAlertsCenter'

export default defineNuxtPlugin(() => {
  // Sécu : ne rien faire si pas côté client
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const { success } = useToast()
  const { addUnread } = useAlertsCenter()

  // --- Storage helpers
  type Op = 'above' | 'below'
  type Alert = {
    id: string
    symbol: string
    op: Op
    price: number
    active: boolean
    createdAt: number
    lastTriggeredAt?: number
  }

  const STORAGE_KEY = 'alerts:v1'
  const EVENTS_KEY = 'alerts:events:v1'
  const COOLDOWN_MS = 5 * 60 * 1000

  const loadAlerts = (): Alert[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  }
  const saveAlerts = (arr: Alert[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
    } catch {}
  }
  const pushEvent = (e: any) => {
    try {
      const arr = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]')
      arr.unshift(e)
      localStorage.setItem(EVENTS_KEY, JSON.stringify(arr.slice(0, 200)))
    } catch {}
  }

  const normalizeSym = (raw: string) => (raw || '').toUpperCase().replace(/\s+/g, '')

  // --- Fetch prix (Spot puis Futures en fallback)
  async function fetchSpotPrice(sym: string): Promise<number | null> {
    try {
      const r = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(sym)}`,
      )
      const j = await r.json()
      if (r.ok && j?.price != null) return Number(j.price)
    } catch {}
    return null
  }
  async function fetchFuturesPrice(sym: string): Promise<number | null> {
    try {
      const r = await fetch(
        `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${encodeURIComponent(sym)}`,
      )
      const j = await r.json()
      if (r.ok && j?.price != null) return Number(j.price)
    } catch {}
    return null
  }
  const priceFor = async (sym: string) =>
    (await fetchSpotPrice(sym)) ?? (await fetchFuturesPrice(sym))

  const uid = () =>
    (globalThis.crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2)

  // --- Boucle
  let timer: number | undefined

  const tick = async () => {
    if (document.hidden) return
    const list = loadAlerts()
    if (!list.length) return

    const now = Date.now()
    let changed = false

    for (const a of list) {
      if (!a.active) continue
      if (a.lastTriggeredAt && now - a.lastTriggeredAt < COOLDOWN_MS) continue

      const sym = normalizeSym(a.symbol)
      const px = await priceFor(sym)
      if (px == null) continue

      const hit = a.op === 'above' ? px >= a.price : px <= a.price
      if (!hit) continue

      a.lastTriggeredAt = now
      a.active = false
      changed = true

      success(`🔔 ${sym} ${a.op === 'above' ? '≥' : '≤'} ${a.price.toLocaleString()}`)
      addUnread(1)
      pushEvent({ id: uid(), alertId: a.id, symbol: sym, price: px, at: now })
    }

    if (changed) saveAlerts(list)
  }

  const start = () => {
    stop()
    // tick immédiat puis toutes les 30s
    tick()
    timer = window.setInterval(tick, 30_000) as unknown as number
  }
  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = undefined
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick()
  })
  start()
})
