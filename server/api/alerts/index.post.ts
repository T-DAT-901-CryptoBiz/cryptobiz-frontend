import { readBody } from 'h3'
import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { createAlert } from '../../utils/alerts'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const session = getAuthSession(event)
    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const body = await readBody(event)
    const { symbol, type, targetPrice, changePercent } = body

    // Validation
    if (!symbol || !type) {
      throw createError({
        statusCode: 400,
        message: 'Symbol and type are required',
      })
    }

    if (type !== 'above' && type !== 'below' && type !== 'change') {
      throw createError({
        statusCode: 400,
        message: 'Type must be "above", "below", or "change"',
      })
    }

    if ((type === 'above' || type === 'below') && !targetPrice) {
      throw createError({
        statusCode: 400,
        message: 'Target price is required for above/below alerts',
      })
    }

    if (type === 'change' && !changePercent) {
      throw createError({
        statusCode: 400,
        message: 'Change percent is required for change alerts',
      })
    }

    const alert = await createAlert(session.userId, {
      symbol: symbol.toUpperCase(),
      type,
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      changePercent: changePercent ? Number(changePercent) : undefined,
    })

    return { alert }
  } catch (error) {
    console.error('[API /api/alerts POST] Error:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
