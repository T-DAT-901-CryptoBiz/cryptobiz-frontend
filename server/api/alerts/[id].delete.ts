import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { deleteAlert } from '../../utils/alerts'

export default defineEventHandler(async (event: H3Event) => {
  try {
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

    const success = await deleteAlert(session.userId, id)

    if (!success) {
      throw createError({
        statusCode: 404,
        message: 'Alert not found',
      })
    }

    return { success: true }
  } catch (error) {
    console.error(`[API /api/alerts/${getRouterParam(event, 'id')} DELETE] Error:`, error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
