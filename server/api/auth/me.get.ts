import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { findUserById } from '../../utils/users'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Not authenticated',
    })
  }

  const user = await findUserById(session.userId)
  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  // Retourner l'utilisateur (sans le password)
  const userWithoutPassword = { ...user }
  delete userWithoutPassword.password
  return {
    user: userWithoutPassword,
  }
})
