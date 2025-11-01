import type { H3Event } from 'h3'
import { clearAuthSession } from '../../utils/session'

export default defineEventHandler(async (event: H3Event) => {
  clearAuthSession(event)
  return { success: true }
})
