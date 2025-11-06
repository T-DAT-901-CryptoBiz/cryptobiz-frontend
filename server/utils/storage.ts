import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const DATA_DIR = join(process.cwd(), '.data')
const PORTFOLIO_FILE = join(DATA_DIR, 'portfolio.json')
const ALERTS_FILE = join(DATA_DIR, 'alerts.json')
const SCREENER_FILE = join(DATA_DIR, 'screener.json')

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

interface PortfolioPosition {
  id: string
  userId: string
  symbol: string
  quantity: number
  avgPrice: number
  createdAt: number
}

interface PriceAlert {
  id: string
  userId: string
  symbol: string
  condition: 'above' | 'below'
  targetPrice: number
  triggered: boolean
  createdAt: number
}

interface ScreenerPreset {
  id: string
  userId: string
  name: string
  filters: {
    minMarketCap: number | null
    maxMarketCap: number | null
    minVolume: number | null
    minChange24h: number | null
    maxChange24h: number | null
  }
  createdAt: number
}

async function readJsonFile<T>(filePath: string): Promise<Record<string, T[]>> {
  await ensureDataDir()
  if (!existsSync(filePath)) {
    return {}
  }
  try {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function writeJsonFile<T>(filePath: string, data: Record<string, T[]>) {
  await ensureDataDir()
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export async function getPortfolioPositions(userId: string): Promise<PortfolioPosition[]> {
  const data = await readJsonFile<PortfolioPosition>(PORTFOLIO_FILE)
  return data[userId] || []
}

export async function savePortfolioPosition(position: PortfolioPosition) {
  const data = await readJsonFile<PortfolioPosition>(PORTFOLIO_FILE)
  if (!data[position.userId]) {
    data[position.userId] = []
  }
  const index = data[position.userId].findIndex((p) => p.id === position.id)
  if (index >= 0) {
    data[position.userId][index] = position
  } else {
    data[position.userId].push(position)
  }
  await writeJsonFile(PORTFOLIO_FILE, data)
}

export async function deletePortfolioPosition(userId: string, positionId: string) {
  const data = await readJsonFile<PortfolioPosition>(PORTFOLIO_FILE)
  if (data[userId]) {
    data[userId] = data[userId].filter((p) => p.id !== positionId)
    await writeJsonFile(PORTFOLIO_FILE, data)
  }
}

export async function getPriceAlerts(userId: string): Promise<PriceAlert[]> {
  const data = await readJsonFile<PriceAlert>(ALERTS_FILE)
  return data[userId] || []
}

export async function savePriceAlert(alert: PriceAlert) {
  const data = await readJsonFile<PriceAlert>(ALERTS_FILE)
  if (!data[alert.userId]) {
    data[alert.userId] = []
  }
  const index = data[alert.userId].findIndex((a) => a.id === alert.id)
  if (index >= 0) {
    data[alert.userId][index] = alert
  } else {
    data[alert.userId].push(alert)
  }
  await writeJsonFile(ALERTS_FILE, data)
}

export async function deletePriceAlert(userId: string, alertId: string) {
  const data = await readJsonFile<PriceAlert>(ALERTS_FILE)
  if (data[userId]) {
    data[userId] = data[userId].filter((a) => a.id !== alertId)
    await writeJsonFile(ALERTS_FILE, data)
  }
}

export async function getScreenerPresets(userId: string): Promise<ScreenerPreset[]> {
  const data = await readJsonFile<ScreenerPreset>(SCREENER_FILE)
  return data[userId] || []
}

export async function saveScreenerPreset(preset: ScreenerPreset) {
  const data = await readJsonFile<ScreenerPreset>(SCREENER_FILE)
  if (!data[preset.userId]) {
    data[preset.userId] = []
  }
  const index = data[preset.userId].findIndex((p) => p.id === preset.id)
  if (index >= 0) {
    data[preset.userId][index] = preset
  } else {
    data[preset.userId].push(preset)
  }
  await writeJsonFile(SCREENER_FILE, data)
}

export async function deleteScreenerPreset(userId: string, presetId: string) {
  const data = await readJsonFile<ScreenerPreset>(SCREENER_FILE)
  if (data[userId]) {
    data[userId] = data[userId].filter((p) => p.id !== presetId)
    await writeJsonFile(SCREENER_FILE, data)
  }
}
