import { deleteScreenerPreset } from '~/server/utils/storage'
import { getAuthSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
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
      message: 'Missing preset ID',
    })
  }

  await deleteScreenerPreset(session.userId, id)
  return { success: true }
})
