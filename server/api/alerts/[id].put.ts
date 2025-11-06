import { readBody } from 'h3'
import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { updateAlert } from '../../utils/alerts'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Alert ID is required',
    })
  }

  const body = await readBody(event)
  const updates: Record<string, unknown> = {}

  if (body.symbol !== undefined) updates.symbol = body.symbol.toUpperCase()
  if (body.type !== undefined) {
    if (body.type !== 'above' && body.type !== 'below' && body.type !== 'change') {
      throw createError({
        statusCode: 400,
        message: 'Type must be "above", "below", or "change"',
      })
    }
    updates.type = body.type
  }
  if (body.targetPrice !== undefined) updates.targetPrice = Number(body.targetPrice)
  if (body.changePercent !== undefined) updates.changePercent = Number(body.changePercent)
  if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive)
  if (body.triggered !== undefined) updates.triggered = Boolean(body.triggered)
  if (body.triggeredAt !== undefined) updates.triggeredAt = body.triggeredAt

  const alert = await updateAlert(session.userId, id, updates)

  if (!alert) {
    throw createError({
      statusCode: 404,
      message: 'Alert not found',
    })
  }

  return { alert }
})
