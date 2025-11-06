import { savePriceAlert } from '~/server/utils/storage'
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
  const { symbol, condition, targetPrice, id } = body

  if (!symbol || !condition || !targetPrice) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  const alert = {
    id: id || Date.now().toString(),
    userId: session.userId,
    symbol: symbol.toUpperCase(),
    condition: condition as 'above' | 'below',
    targetPrice: Number(targetPrice),
    triggered: false,
    createdAt: Date.now(),
  }

  await savePriceAlert(alert)
  return alert
})
