import { ref, computed, onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'

export interface KlineWebSocketMessage {
  type: 'connected' | 'klines' | 'subscribed' | 'ping' | 'error'
  message?: string
  data?: KlineData[]
}

export interface KlineData {
  id?: number
  open_time: string
  close_time: string
  open_price: number
  high_price: number
  low_price: number
  close_price: number
  volume_base: number
  quote_volume?: number
  trades_count?: number
  taker_buy_base?: number
  taker_buy_quote?: number
}

export interface OhlcvPoint {
  t: number // timestamp en millisecondes
  o: number // open
  h: number // high
  l: number // low
  c: number // close
  v: number // volume
}

function mapKlineToOhlcv(kline: KlineData): OhlcvPoint {
  const t = Date.parse(kline.open_time)
  return {
    t,
    o: +kline.open_price,
    h: +kline.high_price,
    l: +kline.low_price,
    c: +kline.close_price,
    v: +kline.volume_base || 0,
  }
}

export interface UseKlinesWebSocketOptions {
  symbol: Ref<string> | string
  interval: Ref<string> | string
  updateInterval?: number // Intervalle de mise à jour en secondes (défaut: 1)
  enabled?: Ref<boolean> | boolean
}

export function useKlinesWebSocket(opts: UseKlinesWebSocketOptions) {
  const baseUrl = 'ws://127.0.0.1:8004'

  const symbol = typeof opts.symbol === 'string' ? ref(opts.symbol) : opts.symbol
  const interval = typeof opts.interval === 'string' ? ref(opts.interval) : opts.interval
  const updateInterval = opts.updateInterval ?? 1
  const enabled =
    typeof opts.enabled === 'boolean' ? ref(opts.enabled) : (opts.enabled ?? ref(true))

  const data = ref<OhlcvPoint[]>([])
  const pending = ref(false)
  const error = ref<string | null>(null)
  const connected = ref(false)
  const subscribed = ref(false)

  let ws: WebSocket | null = null
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 10
  const reconnectDelay = 5000 // 5 secondes

  const wsUrl = computed(() => {
    const sym = symbol.value
    const int = interval.value
    const url = new URL(`${baseUrl}/ws/klines/${sym}/${int}`)
    if (updateInterval !== 1) {
      url.searchParams.set('update_interval', String(updateInterval))
    }
    return url.toString()
  })

  function sendMessage(action: 'subscribe' | 'unsubscribe' | 'get_latest' | 'ping') {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action }))
    }
  }

  function startHeartbeat() {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        sendMessage('ping')
      }
    }, 30000) // Ping toutes les 30 secondes
  }

  function stopHeartbeat() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  function handleMessage(event: MessageEvent) {
    try {
      const message: KlineWebSocketMessage = JSON.parse(event.data)

      switch (message.type) {
        case 'connected':
          connected.value = true
          error.value = null
          reconnectAttempts = 0
          // S'abonner automatiquement après connexion
          // Le serveur enverra automatiquement les données après subscription
          sendMessage('subscribe')
          break

        case 'subscribed':
          subscribed.value = true
          pending.value = false
          // Le serveur enverra automatiquement les données après subscription
          // Pas besoin d'appeler get_latest ici, cela serait redondant
          break

        case 'klines':
          if (message.data && Array.isArray(message.data)) {
            const newData = message.data.map(mapKlineToOhlcv)
            // Trier par timestamp (ascendant)
            newData.sort((a, b) => a.t - b.t)

            // Fusionner avec les données existantes en évitant les doublons
            const existing = new Map(data.value.map((d) => [d.t, d]))
            newData.forEach((point) => {
              existing.set(point.t, point)
            })
            data.value = Array.from(existing.values()).sort((a, b) => a.t - b.t)
            pending.value = false
          }
          break

        case 'ping':
          // Répondre au ping du serveur
          sendMessage('ping')
          break

        case 'error':
          error.value = message.message || 'Unknown error'
          pending.value = false
          console.error('WebSocket error message:', message.message)
          break

        default:
          // Ignore unknown message types
          break
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err)
      error.value = 'Failed to parse server message'
    }
  }

  function connect() {
    if (!enabled.value) return
    if (ws && ws.readyState === WebSocket.OPEN) return

    pending.value = true
    error.value = null

    try {
      ws = new WebSocket(wsUrl.value)

      ws.onopen = () => {
        connected.value = true
        startHeartbeat()
      }

      ws.onmessage = handleMessage

      ws.onerror = (event) => {
        console.error('WebSocket error event:', event)
        error.value = 'WebSocket connection error - check server logs'
        pending.value = false
        connected.value = false
      }

      ws.onclose = (event) => {
        connected.value = false
        subscribed.value = false
        stopHeartbeat()

        // Code 1005 = No Status Received (fermeture inattendue, souvent normale)
        // Code 1000 = Normal Closure (fermeture normale)
        // Code 1001 = Going Away (le serveur ferme la connexion)
        // Codes 1002-1015 = Erreurs de protocole
        const isNormalClosure = event.code === 1000 || event.code === 1001 || event.code === 1005
        const isError = !isNormalClosure && event.code >= 1002 && event.code <= 1015

        // Afficher un message seulement pour les vraies erreurs
        if (isError) {
          error.value = `WebSocket closed with error code: ${event.code}. Server may have encountered an error. Check server logs.`
          console.error('WebSocket closed with error code:', event.code, 'reason:', event.reason)
        } else if (event.code === 1005) {
          // Code 1005 est généralement dû à une fermeture inattendue (réseau, serveur redémarré, etc.)
          // Ne pas afficher d'erreur, juste logger pour debug
          console.log('WebSocket closed unexpectedly (code 1005). Attempting to reconnect...')
          error.value = null // Réinitialiser l'erreur pour permettre la reconnexion
        }

        // Tentative de reconnexion automatique pour tous les cas (sauf si désactivé)
        if (enabled.value && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          reconnectTimer = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`)
            connect()
          }, reconnectDelay)
        } else if (reconnectAttempts >= maxReconnectAttempts && enabled.value) {
          error.value =
            'Max reconnection attempts reached. Server may be experiencing issues. Please refresh the page.'
        }
      }
    } catch (err) {
      console.error('Error creating WebSocket:', err)
      error.value = 'Failed to create WebSocket connection'
      pending.value = false
    }
  }

  function disconnect() {
    // Annuler tous les timers
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    stopHeartbeat()

    // Fermer la connexion WebSocket proprement
    if (ws) {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        try {
          sendMessage('unsubscribe')
        } catch {
          // Ignore si la connexion est déjà fermée
        }
      }
      try {
        ws.close()
      } catch {
        // Ignore si déjà fermé
      }
      ws = null
    }
    connected.value = false
    subscribed.value = false
    reconnectAttempts = 0 // Réinitialiser les tentatives
  }

  function refresh() {
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendMessage('get_latest')
      pending.value = true
    } else {
      connect()
    }
  }

  // Reconnecter quand le symbol ou l'interval change
  watch([symbol, interval], () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (enabled.value) {
      // Déconnecter immédiatement l'ancienne connexion
      disconnect()
      // Petit délai pour éviter les reconnexions trop rapides
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null
        if (enabled.value) {
          connect()
        }
      }, 100)
    }
  })

  // Gérer l'activation/désactivation
  watch(enabled, (isEnabled) => {
    if (isEnabled) {
      connect()
    } else {
      disconnect()
    }
  })

  // Connexion initiale
  if (import.meta.client && enabled.value) {
    connect()
  }

  // Nettoyage lors du démontage
  onBeforeUnmount(() => {
    // Annuler toute reconnexion en attente
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    // Désactiver et déconnecter
    enabled.value = false
    disconnect()
  })

  return {
    data,
    pending,
    error,
    connected,
    subscribed,
    connect,
    disconnect,
    refresh,
  }
}
