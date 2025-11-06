import { getScreenerPresets } from '~/server/utils/storage'
import { getAuthSession } from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const presets = await getScreenerPresets(session.userId)
  return presets
})
