import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export interface PriceAlert {
  id: string
  userId: string
  symbol: string
  type: 'above' | 'below' | 'change'
  targetPrice?: number
  changePercent?: number
  isActive: boolean
  triggered: boolean
  triggeredAt?: string
  createdAt: string
  updatedAt: string
}

const ALERTS_FILE = join(process.cwd(), '.data', 'alerts.json')

async function ensureDataDir() {
  const dataDir = join(process.cwd(), '.data')
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
}

async function loadAlerts(): Promise<PriceAlert[]> {
  await ensureDataDir()
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

async function saveAlerts(alerts: PriceAlert[]) {
  await ensureDataDir()
  await writeFile(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8')
}

export async function getUserAlerts(userId: string): Promise<PriceAlert[]> {
  const allAlerts = await loadAlerts()
  return allAlerts.filter((a) => a.userId === userId)
}

export async function createAlert(
  userId: string,
  alert: Omit<PriceAlert, 'id' | 'userId' | 'isActive' | 'triggered' | 'createdAt' | 'updatedAt'>,
): Promise<PriceAlert> {
  const allAlerts = await loadAlerts()

  const newAlert: PriceAlert = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    isActive: true,
    triggered: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  allAlerts.push(newAlert)
  await saveAlerts(allAlerts)
  return newAlert
}

export async function updateAlert(
  userId: string,
  alertId: string,
  updates: Partial<Omit<PriceAlert, 'id' | 'userId' | 'createdAt'>>,
): Promise<PriceAlert | null> {
  const allAlerts = await loadAlerts()
  const alert = allAlerts.find((a) => a.id === alertId && a.userId === userId)

  if (!alert) {
    return null
  }

  // Si on marque comme déclenchée, ajouter la date
  if (updates.triggered === true && !alert.triggered) {
    updates.triggeredAt = new Date().toISOString()
  }

  Object.assign(alert, {
    ...updates,
    updatedAt: new Date().toISOString(),
  })

  await saveAlerts(allAlerts)
  return alert
}

export async function deleteAlert(userId: string, alertId: string): Promise<boolean> {
  const allAlerts = await loadAlerts()
  const index = allAlerts.findIndex((a) => a.id === alertId && a.userId === userId)

  if (index === -1) {
    return false
  }

  allAlerts.splice(index, 1)
  await saveAlerts(allAlerts)
  return true
}

export async function toggleAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
  const allAlerts = await loadAlerts()
  const alert = allAlerts.find((a) => a.id === alertId && a.userId === userId)

  if (!alert) {
    return null
  }

  alert.isActive = !alert.isActive
  alert.updatedAt = new Date().toISOString()

  await saveAlerts(allAlerts)
  return alert
}

export async function resetAlert(userId: string, alertId: string): Promise<PriceAlert | null> {
  const allAlerts = await loadAlerts()
  const alert = allAlerts.find((a) => a.id === alertId && a.userId === userId)

  if (!alert) {
    return null
  }

  alert.triggered = false
  alert.triggeredAt = undefined
  alert.isActive = true
  alert.updatedAt = new Date().toISOString()

  await saveAlerts(allAlerts)
  return alert
}
