import type { H3Event } from 'h3'
import { requireAdmin } from '../../../utils/admin'
import { readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

async function loadAllAlerts() {
  const ALERTS_FILE = join(process.cwd(), '.data', 'alerts.json')
  const dataDir = join(process.cwd(), '.data')

  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

  if (!existsSync(ALERTS_FILE)) {
    return []
  }

  try {
    const content = await readFile(ALERTS_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  try {
    const allAlerts = await loadAllAlerts()
    return { alerts: allAlerts }
  } catch (error) {
    console.error('[API /api/admin/alerts GET] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
