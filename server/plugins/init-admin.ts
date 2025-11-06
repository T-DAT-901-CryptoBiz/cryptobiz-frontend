import { initAdminUser } from '../utils/init-admin'

export default defineNitroPlugin(async () => {
  // Initialiser le compte admin au démarrage du serveur
  await initAdminUser()
})
