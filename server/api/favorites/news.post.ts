import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { addNewsFavorite } from '../../utils/favorites'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
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
