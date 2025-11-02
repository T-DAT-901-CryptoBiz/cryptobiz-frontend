import { getAuthSession } from '../../utils/session'
import { getNewsFavorites } from '../../utils/favorites'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const favorites = await getNewsFavorites(session.userId)
  return { favorites }
})
