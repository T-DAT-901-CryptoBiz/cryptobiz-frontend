export default defineNuxtRouteMiddleware(async (to) => {
  // Ne pas exécuter côté serveur
  if (import.meta.server) {
    return
  }

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(to.path)

  const { isAuthenticated, pending, refresh } = useAuth()

  // S'assurer que l'état d'authentification est vérifié
  // Attendre que le chargement soit terminé
  if (pending.value) {
    try {
      await refresh()
    } catch {
      // Si erreur, user sera null, on continuera avec la vérification
    }
  }

  // Si on est authentifié et qu'on essaie d'accéder à login/register, rediriger vers dashboard
  if (isPublicRoute && isAuthenticated.value) {
    return navigateTo('/')
  }

  // Si la route est publique, autoriser l'accès
  if (isPublicRoute) {
    return
  }

  // Pour toutes les autres routes, vérifier l'authentification
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
