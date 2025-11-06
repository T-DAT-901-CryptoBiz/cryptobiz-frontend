import { getDb } from './db'

export interface PortfolioPosition {
  id: string
  userId: string
  symbol: string
  quantity: number
  avgPrice: number
  createdAt: number
}

export interface PriceAlert {
  id: string
  userId: string
  symbol: string
  condition: 'above' | 'below'
  targetPrice: number
  triggered: boolean
  createdAt: number
}

export interface ScreenerPreset {
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

// Portfolio functions
export async function getPortfolioPositions(userId: string): Promise<PortfolioPosition[]> {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM portfolio_positions WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Array<{
    id: string
    user_id: string
    symbol: string
    quantity: number
    avg_price: number
    created_at: number
  }>

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    quantity: row.quantity,
    avgPrice: row.avg_price,
    createdAt: row.created_at,
  }))
}

export async function savePortfolioPosition(position: PortfolioPosition) {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO portfolio_positions 
    (id, user_id, symbol, quantity, avg_price, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    position.id,
    position.userId,
    position.symbol,
    position.quantity,
    position.avgPrice,
    position.createdAt,
  )
}

export async function deletePortfolioPosition(userId: string, positionId: string) {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM portfolio_positions WHERE id = ? AND user_id = ?')
  stmt.run(positionId, userId)
}

// Price alerts functions
export async function getPriceAlerts(userId: string): Promise<PriceAlert[]> {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM price_alerts WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Array<{
    id: string
    user_id: string
    symbol: string
    condition: string
    target_price: number
    triggered: number
    created_at: number
  }>

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    symbol: row.symbol,
    condition: row.condition as 'above' | 'below',
    targetPrice: row.target_price,
    triggered: row.triggered === 1,
    createdAt: row.created_at,
  }))
}

export async function savePriceAlert(alert: PriceAlert) {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO price_alerts 
    (id, user_id, symbol, condition, target_price, triggered, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    alert.id,
    alert.userId,
    alert.symbol,
    alert.condition,
    alert.targetPrice,
    alert.triggered ? 1 : 0,
    alert.createdAt,
  )
}

export async function deletePriceAlert(userId: string, alertId: string) {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM price_alerts WHERE id = ? AND user_id = ?')
  stmt.run(alertId, userId)
}

// Screener presets functions
export async function getScreenerPresets(userId: string): Promise<ScreenerPreset[]> {
  const db = getDb()
  const rows = db
    .prepare('SELECT * FROM screener_presets WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId) as Array<{
    id: string
    user_id: string
    name: string
    min_market_cap: number | null
    max_market_cap: number | null
    min_volume: number | null
    min_change_24h: number | null
    max_change_24h: number | null
    created_at: number
  }>

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    filters: {
      minMarketCap: row.min_market_cap,
      maxMarketCap: row.max_market_cap,
      minVolume: row.min_volume,
      minChange24h: row.min_change_24h,
      maxChange24h: row.max_change_24h,
    },
    createdAt: row.created_at,
  }))
}

export async function saveScreenerPreset(preset: ScreenerPreset) {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO screener_presets 
    (id, user_id, name, min_market_cap, max_market_cap, min_volume, min_change_24h, max_change_24h, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  stmt.run(
    preset.id,
    preset.userId,
    preset.name,
    preset.filters.minMarketCap,
    preset.filters.maxMarketCap,
    preset.filters.minVolume,
    preset.filters.minChange24h,
    preset.filters.maxChange24h,
    preset.createdAt,
  )
}

export async function deleteScreenerPreset(userId: string, presetId: string) {
  const db = getDb()
  const stmt = db.prepare('DELETE FROM screener_presets WHERE id = ? AND user_id = ?')
  stmt.run(presetId, userId)
}
