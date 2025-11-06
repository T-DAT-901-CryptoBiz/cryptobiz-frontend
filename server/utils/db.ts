import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const DATA_DIR = join(process.cwd(), '.data')
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

const DB_PATH = join(DATA_DIR, 'database.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    initializeSchema(db)
  }
  return db
}

function initializeSchema(database: Database.Database) {
  // Portfolio positions
  database.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_positions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      quantity REAL NOT NULL,
      avg_price REAL NOT NULL,
      created_at INTEGER NOT NULL,
      INDEX idx_user_id (user_id)
    )
  `)

  // Price alerts
  database.exec(`
    CREATE TABLE IF NOT EXISTS price_alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      condition TEXT NOT NULL CHECK(condition IN ('above', 'below')),
      target_price REAL NOT NULL,
      triggered INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      INDEX idx_user_id (user_id),
      INDEX idx_triggered (triggered)
    )
  `)

  // Screener presets
  database.exec(`
    CREATE TABLE IF NOT EXISTS screener_presets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      min_market_cap REAL,
      max_market_cap REAL,
      min_volume REAL,
      min_change_24h REAL,
      max_change_24h REAL,
      created_at INTEGER NOT NULL,
      INDEX idx_user_id (user_id)
    )
  `)
}
