import { findUserByEmail, createUser } from './users'

/**
 * Initialise un compte admin par défaut si il n'existe pas
 * Email: admin@cryptobiz.com
 * Password: admin123
 */
export async function initAdminUser() {
  const adminEmail = 'admin@cryptobiz.com'
  const existingAdmin = await findUserByEmail(adminEmail)

  if (!existingAdmin) {
    console.log('[Init] Creating default admin user...')
    const admin = await createUser({
      email: adminEmail,
      password: 'admin123',
      name: 'Admin',
      provider: 'local',
      role: 'admin',
    })
    console.log(`[Init] Admin user created: ${admin.email} (ID: ${admin.id})`)
    console.log('[Init] Default credentials:')
    console.log(`[Init]   Email: ${adminEmail}`)
    console.log(`[Init]   Password: admin123`)
    return admin
  } else {
    // Mettre à jour le rôle si l'utilisateur existe mais n'est pas admin
    if (existingAdmin.role !== 'admin') {
      const { updateUser } = await import('./users')
      await updateUser(existingAdmin.id, { role: 'admin' })
      console.log(`[Init] Updated user ${existingAdmin.email} to admin role`)
    }
    return existingAdmin
  }
}
