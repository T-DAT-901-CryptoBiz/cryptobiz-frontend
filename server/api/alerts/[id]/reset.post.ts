import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { getAuthSession } from '../../../utils/session'
import { resetAlert } from '../../../utils/alerts'

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

  const alert = await resetAlert(session.userId, id)

  if (!alert) {
    throw createError({
      statusCode: 404,
      message: 'Alert not found',
    })
  }

  return { alert }
})
