import { readBody } from 'h3'
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
  userId: string
  symbol: string
  type: 'above' | 'below' | 'change'
  targetPrice?: number
  changePercent?: number
  isActive: boolean
  triggered: boolean
  createdAt: string
  updatedAt?: string
  triggeredAt?: string
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

    const body = await readBody(event)
    const allAlerts = (await loadAllAlerts()) as Alert[]
    const alert = allAlerts.find((a) => a.id === id)

    if (!alert) {
      throw createError({
        statusCode: 404,
        message: 'Alert not found',
      })
    }

    const updates: Record<string, unknown> = {}

    if (body.symbol !== undefined) updates.symbol = body.symbol.toUpperCase()
    if (body.type !== undefined) {
      if (body.type !== 'above' && body.type !== 'below' && body.type !== 'change') {
        throw createError({
          statusCode: 400,
          message: 'Type must be "above", "below", or "change"',
        })
      }
      updates.type = body.type
    }
    if (body.targetPrice !== undefined) updates.targetPrice = Number(body.targetPrice)
    if (body.changePercent !== undefined) updates.changePercent = Number(body.changePercent)
    if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive)
    if (body.triggered !== undefined) updates.triggered = Boolean(body.triggered)
    if (body.triggeredAt !== undefined) updates.triggeredAt = body.triggeredAt

    Object.assign(alert, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })

    await saveAlerts(allAlerts)

    return { alert }
  } catch (error) {
    console.error(`[API /api/admin/alerts/${getRouterParam(event, 'id')} PUT] Error:`, error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
