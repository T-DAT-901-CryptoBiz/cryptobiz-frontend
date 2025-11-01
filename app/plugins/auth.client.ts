export default defineNuxtPlugin({
  name: 'auth-init',
  enforce: 'pre', // Exécuter avant les autres plugins
  setup(nuxtApp) {
    // Charger l'utilisateur dès que possible
    if (import.meta.client) {
      nuxtApp.hook('app:created', async () => {
        const { refresh } = useAuth()
        await refresh()
      })
    }
  },
})
