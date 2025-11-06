import { savePortfolioPosition } from '~/server/utils/storage'
import { getAuthSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const { symbol, quantity, avgPrice, id } = body

  if (!symbol || !quantity || !avgPrice) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  const position = {
    id: id || Date.now().toString(),
    userId: session.userId,
    symbol: symbol.toUpperCase(),
    quantity: Number(quantity),
    avgPrice: Number(avgPrice),
    createdAt: Date.now(),
  }

  await savePortfolioPosition(position)
  return position
})
