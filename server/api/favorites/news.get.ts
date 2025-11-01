import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { getNewsFavorites } from '../../utils/favorites'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const favorites = await getNewsFavorites(session.userId)
  return { favorites }
})
