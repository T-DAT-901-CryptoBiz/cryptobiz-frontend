import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { getUserAlerts } from '../../utils/alerts'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const session = getAuthSession(event)
    if (!session) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized',
      })
    }

    const alerts = await getUserAlerts(session.userId)
    return { alerts }
  } catch (error) {
    console.error('[API /api/alerts GET] Error:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
