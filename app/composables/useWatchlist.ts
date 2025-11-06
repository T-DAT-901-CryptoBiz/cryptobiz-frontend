export function useWatchlist() {
  const { isAuthenticated } = useAuth()
  const list = useState<string[]>('watchlist', () => [])

  // Charger les favoris depuis l'API
  const refresh = async () => {
    if (!import.meta.client || !isAuthenticated.value) {
      list.value = []
      return
    }

    try {
      const { favorites } = await $fetch<{ favorites: string[] }>('/api/favorites/crypto')
      list.value = favorites || []
    } catch {
      list.value = []
    }
  }

  // Charger au montage si authentifié
  if (import.meta.client && isAuthenticated.value && list.value.length === 0) {
    void refresh()
  }

  // Recharger les favoris quand l'authentification change
  if (import.meta.client) {
    watch(isAuthenticated, (auth) => {
      if (auth) {
        void refresh()
      } else {
        list.value = []
      }
    })
  }

  const add = async (s: string) => {
    if (!import.meta.client || !isAuthenticated.value) return

    if (!list.value.includes(s)) {
      try {
        await $fetch('/api/favorites/crypto', {
          method: 'POST',
          body: { symbol: s },
        })
        list.value.push(s)
      } catch {
        // Ignore errors
      }
    }
  }

  const remove = async (s: string) => {
    if (!import.meta.client || !isAuthenticated.value) return

    try {
      await $fetch('/api/favorites/crypto', {
        method: 'DELETE',
        query: { symbol: s },
      })
      list.value = list.value.filter((x) => x !== s)
    } catch {
      // Ignore errors
    }
  }

  const toggle = async (s: string) => {
    if (list.value.includes(s)) {
      await remove(s)
    } else {
      await add(s)
    }
  }

  return { list, add, remove, toggle, refresh }
}
