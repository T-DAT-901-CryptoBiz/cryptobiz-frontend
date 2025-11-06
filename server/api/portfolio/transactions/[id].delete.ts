import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { getAuthSession } from '../../../utils/session'
import { deleteTransaction } from '../../../utils/portfolio'

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
      message: 'Transaction ID is required',
    })
  }

  const success = await deleteTransaction(session.userId, id)

  if (!success) {
    throw createError({
      statusCode: 404,
      message: 'Transaction not found',
    })
  }

  return { success: true }
})
