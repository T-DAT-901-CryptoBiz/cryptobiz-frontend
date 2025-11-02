import { getAuthSession } from '../../utils/session'
import { addNewsFavorite } from '../../utils/favorites'

export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  if (!session?.userId) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const { newsId } = body

  if (!newsId || typeof newsId !== 'number') {
    throw createError({
      statusCode: 400,
      message: 'News ID is required',
    })
  }

  await addNewsFavorite(session.userId, newsId)
  return { success: true }
})
