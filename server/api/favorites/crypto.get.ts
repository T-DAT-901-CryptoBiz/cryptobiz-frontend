import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { getCryptoFavorites } from '../../utils/favorites'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const favorites = await getCryptoFavorites(session.userId)
  return { favorites }
})
