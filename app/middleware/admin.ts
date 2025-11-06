import { watch } from 'vue'

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, isAdmin, pending } = useAuth()

  // Attendre que l'authentification soit résolue
  if (pending.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(pending, (p) => {
        if (!p) {
          unwatch()
          resolve()
        }
      })
    })
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Rediriger vers home si non admin
  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
