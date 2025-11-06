import { watch } from 'vue'

export default defineNuxtPlugin({
  name: 'alerts-checker',
  setup(nuxtApp) {
    if (import.meta.server) return

    nuxtApp.hook('app:mounted', () => {
      const { isAuthenticated, pending: authPending } = useAuth()
      const { rows, pending: dataPending } = useAll24h()
      const { showNotification } = useNotifications()
      let checkInterval: ReturnType<typeof setInterval> | null = null

      async function checkAlerts() {
        console.log('[Alerts] checkAlerts() called')
        if (!isAuthenticated.value) {
          console.log('[Alerts] User not authenticated')
          return
        }

        if (rows.value.length === 0) {
          console.log('[Alerts] No price data available yet')
          return
        }

        try {
          // Récupérer les alertes actives
          const response = await $fetch<{
            alerts: Array<{
              id: string
              symbol: string
              type: 'above' | 'below' | 'change'
              targetPrice?: number
              changePercent?: number
              isActive: boolean
              triggered: boolean
              createdAt: string
            }>
          }>('/api/alerts')

          // Filtrer les alertes actives non déclenchées et créées il y a plus de 5 secondes
          // Cela évite de déclencher immédiatement une alerte qui vient d'être créée
          const now = Date.now()
          const activeAlerts = response.alerts.filter((a) => {
            if (!a.isActive || a.triggered) return false
            // Ignorer les alertes créées il y a moins de 5 secondes
            const createdAt = new Date(a.createdAt || 0).getTime()
            const ageInSeconds = (now - createdAt) / 1000
            return ageInSeconds >= 5
          })

          if (activeAlerts.length === 0) {
            console.log('[Alerts] No active alerts to check')
            return
          }

          console.log(`[Alerts] Checking ${activeAlerts.length} active alerts`)

          // Vérifier chaque alerte
          for (const alert of activeAlerts) {
            const ticker = rows.value.find((r) => r.symbol === alert.symbol)
            if (!ticker) {
              console.log(`[Alerts] No ticker data for ${alert.symbol}`)
              continue
            }

            const currentPrice = Number(ticker.lastPrice || 0)
            const priceChangePercent = Number(ticker.priceChangePercent || 0)
            let shouldTrigger = false
            let message = ''

            console.log(
              `[Alerts] Checking alert ${alert.id}: ${alert.symbol} type=${alert.type} target=${alert.targetPrice} current=${currentPrice}`,
            )

            if (
              alert.type === 'above' &&
              alert.targetPrice !== undefined &&
              currentPrice >= alert.targetPrice
            ) {
              shouldTrigger = true
              message = `${alert.symbol.replace('USDC', '')} reached $${alert.targetPrice.toLocaleString()}!`
            } else if (
              alert.type === 'below' &&
              alert.targetPrice !== undefined &&
              currentPrice <= alert.targetPrice
            ) {
              shouldTrigger = true
              message = `${alert.symbol.replace('USDC', '')} dropped to $${alert.targetPrice.toLocaleString()}!`
            } else if (alert.type === 'change' && alert.changePercent !== undefined) {
              const absChange = Math.abs(priceChangePercent)
              if (absChange >= Math.abs(alert.changePercent)) {
                shouldTrigger = true
                const sign = priceChangePercent >= 0 ? '+' : ''
                message = `${alert.symbol.replace('USDC', '')} changed ${sign}${priceChangePercent.toFixed(2)}%!`
              }
            }

            if (shouldTrigger) {
              console.log(`[Alerts] Triggering alert: ${message}`)
              // Marquer l'alerte comme déclenchée côté serveur
              try {
                const result = await $fetch(`/api/alerts/${alert.id}`, {
                  method: 'PUT',
                  body: {
                    triggered: true,
                    triggeredAt: new Date().toISOString(),
                  },
                })
                console.log('[Alerts] Alert updated successfully:', result)

                // Afficher la notification
                showNotification(message, 'success')

                // Déclencher un événement pour mettre à jour la page des alertes
                if (import.meta.client) {
                  console.log('[Alerts] Dispatching alert-triggered event')
                  window.dispatchEvent(
                    new CustomEvent('alert-triggered', { detail: { alertId: alert.id } }),
                  )
                }
              } catch (error) {
                console.error('[Alerts] Error triggering alert:', error)
              }
            } else {
              console.log(
                `[Alerts] Alert ${alert.id} not triggered: currentPrice=${currentPrice} targetPrice=${alert.targetPrice} condition not met`,
              )
            }
          }
        } catch (error) {
          console.error('[Alerts] Error checking alerts:', error)
        }
      }

      // Attendre que l'authentification soit résolue
      const startChecking = () => {
        if (authPending.value) {
          const unwatch = watch(authPending, (pending) => {
            if (!pending) {
              unwatch()
              startChecking()
            }
          })
          return
        }

        if (!isAuthenticated.value) {
          console.log('[Alerts] User not authenticated, skipping alerts check')
          return
        }

        // Attendre que les données soient chargées
        if (dataPending.value || rows.value.length === 0) {
          const unwatch = watch([dataPending, () => rows.value.length], ([pending, length]) => {
            if (!pending && length > 0) {
              unwatch()
              startChecking()
            }
          })
          return
        }

        console.log('[Alerts] Starting alerts checker')
        // Vérifier immédiatement
        checkAlerts()
        // Puis vérifier toutes les 30 secondes
        checkInterval = setInterval(checkAlerts, 30000)
      }

      // Exposer la fonction globalement pour pouvoir l'appeler manuellement
      if (import.meta.client) {
        ;(window as { __checkAlerts?: () => Promise<void> }).__checkAlerts = checkAlerts
      }

      // Démarrer la vérification
      startChecking()

      // Vérifier aussi quand les données de prix changent
      watch(
        () => rows.value.length,
        () => {
          if (isAuthenticated.value && rows.value.length > 0 && checkInterval) {
            checkAlerts()
          }
        },
      )

      // Nettoyer à la destruction
      nuxtApp.hook('app:beforeUnmount', () => {
        if (checkInterval) {
          clearInterval(checkInterval)
        }
      })
    })
  },
})
