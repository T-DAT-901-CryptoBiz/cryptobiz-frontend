import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { requireAdmin } from '../../../utils/admin'
import { readFile, writeFile, mkdir } from 'fs/promises'
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

interface Alert {
  id: string
  [key: string]: unknown
}

async function saveAlerts(alerts: Alert[]) {
  const ALERTS_FILE = join(process.cwd(), '.data', 'alerts.json')
  const dataDir = join(process.cwd(), '.data')

  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

  await writeFile(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8')
}

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Alert ID is required',
      })
    }

    const allAlerts = (await loadAllAlerts()) as Alert[]
    const index = allAlerts.findIndex((a) => a.id === id)

    if (index === -1) {
      throw createError({
        statusCode: 404,
        message: 'Alert not found',
      })
    }

    allAlerts.splice(index, 1)
    await saveAlerts(allAlerts)

    return { success: true }
  } catch (error) {
    console.error(`[API /api/admin/alerts/${getRouterParam(event, 'id')} DELETE] Error:`, error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
