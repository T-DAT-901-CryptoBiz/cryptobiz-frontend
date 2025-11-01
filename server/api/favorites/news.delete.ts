import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { removeNewsFavorite } from '../../utils/favorites'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const query = getQuery(event)
  const newsId = Number.parseInt(query.id as string, 10)

  if (!newsId || Number.isNaN(newsId)) {
    throw createError({
      statusCode: 400,
      message: 'News ID is required',
    })
  }

  await removeNewsFavorite(session.userId, newsId)
  return { success: true }
})
