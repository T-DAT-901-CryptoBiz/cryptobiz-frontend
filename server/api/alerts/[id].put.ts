import { getPriceAlerts, savePriceAlert } from '~/server/utils/storage'
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
      message: 'Missing alert ID',
    })
  }

  const alerts = await getPriceAlerts(session.userId)
  const alert = alerts.find((a) => a.id === id)

  if (!alert) {
    throw createError({
      statusCode: 404,
      message: 'Alert not found',
    })
  }

  const body = await readBody(event)
  const updatedAlert = { ...alert, ...body }

  await savePriceAlert(updatedAlert)
  return updatedAlert
})
