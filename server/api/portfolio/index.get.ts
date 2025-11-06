import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { getPortfolio } from '../../utils/portfolio'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const portfolio = await getPortfolio(session.userId)
  return portfolio
})
