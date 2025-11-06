import { saveScreenerPreset } from '~/server/utils/storage'
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
  const { name, filters, id } = body

  if (!name || !filters) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  const preset = {
    id: id || Date.now().toString(),
    userId: session.userId,
    name,
    filters,
    createdAt: Date.now(),
  }

  await saveScreenerPreset(preset)
  return preset
})
