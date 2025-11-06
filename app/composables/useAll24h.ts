import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Ticker24h } from '~/types/binance'

// Singleton global pour partager les données entre tous les composants
// Évite les appels multiples à l'API
const globalState = {
  rows: ref<Ticker24h[]>([]),
  pending: ref(true),
  initialized: false, // Flag pour savoir si on a déjà tenté de charger
  subscribers: new Set<() => void>(),
  loadingPromise: null as Promise<void> | null,
}

export function useAll24h() {
  const { ticker24h } = useBinanceMarket()

  const load = async (forceRefresh = false) => {
    // Si déjà en cours de chargement, attendre la promesse existante
    if (globalState.loadingPromise) {
      await globalState.loadingPromise
      return
    }

    globalState.pending.value = true
    globalState.loadingPromise = (async () => {
      try {
        const r = await ticker24h()

        // Si pas encore chargé ou si forceRefresh, attendre le chargement
        if (r.pending.value || forceRefresh) {
          // Utiliser refresh() pour forcer le chargement et attendre
          if (r.refresh) {
            await r.refresh()
          }
          // Attendre que pending devienne false
          if (r.pending.value) {
            await new Promise<void>((resolve) => {
              const stop = watch(r.pending, (pending) => {
                if (!pending) {
                  stop()
                  resolve()
                }
              })
              // Timeout de sécurité
              setTimeout(() => {
                stop()
                resolve()
              }, 10000)
            })
          }
        }

        const data = (r.data.value ?? []) as Ticker24h[]
        globalState.rows.value = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error loading ticker24h:', error)
        globalState.rows.value = []
      } finally {
        globalState.pending.value = false
        globalState.initialized = true
        globalState.loadingPromise = null
        // Notifier tous les subscribers
        globalState.subscribers.forEach((cb) => cb())
      }
    })()

    await globalState.loadingPromise
  }

  // Synchroniser le pending local avec le global
  const localPending = ref(globalState.pending.value)
  const updatePending = () => {
    localPending.value = globalState.pending.value
  }

  // Déclencher le chargement dès l'appel du composable (côté client uniquement)
  // Cela garantit que les données se chargent même si aucun composant ne se monte immédiatement
  if (import.meta.client && !globalState.initialized && !globalState.loadingPromise) {
    // Initialiser le chargement de manière asynchrone
    void load()
  }

  onMounted(() => {
    globalState.subscribers.add(updatePending)
    // S'assurer que pending est synchronisé
    updatePending()
    // Si pas encore initialisé, déclencher le chargement
    if (!globalState.initialized && !globalState.loadingPromise) {
      void load()
    }
    // Si déjà chargé mais que pending est faux, mettre à jour
    else if (globalState.rows.value.length > 0) {
      localPending.value = false
    }
  })

  onBeforeUnmount(() => {
    globalState.subscribers.delete(updatePending)
  })

  return {
    rows: globalState.rows, // Réactif partagé
    pending: localPending,
    refresh: load,
  }
}
