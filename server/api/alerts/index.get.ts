import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { getUserAlerts } from '../../utils/alerts'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const alerts = await getUserAlerts(session.userId)
  return { alerts }
})
