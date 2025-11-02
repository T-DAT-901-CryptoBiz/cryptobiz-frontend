import { getAuthSession } from '../../utils/session'
import { removeNewsFavorite } from '../../utils/favorites'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session?.userId) {
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
