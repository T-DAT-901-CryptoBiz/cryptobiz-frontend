import type { H3Event } from 'h3'
import { getAuthSession } from './session'
import { findUserById } from './users'

/**
 * Vérifie si l'utilisateur actuel est un admin
 */
export async function isAdmin(event: H3Event): Promise<boolean> {
  const session = getAuthSession(event)
  if (!session) {
    return false
  }

  const user = await findUserById(session.userId)
  return user?.role === 'admin'
}

/**
 * Middleware pour protéger les routes admin
 * Lance une erreur 403 si l'utilisateur n'est pas admin
 */
export async function requireAdmin(event: H3Event): Promise<void> {
  const admin = await isAdmin(event)
  if (!admin) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Admin access required',
    })
  }
}
