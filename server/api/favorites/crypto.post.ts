import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { addCryptoFavorite } from '../../utils/favorites'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const { symbol } = body

  if (!symbol || typeof symbol !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'Symbol is required',
    })
  }

  await addCryptoFavorite(session.userId, symbol)
  return { success: true }
})
