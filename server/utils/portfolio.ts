import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export interface PortfolioPosition {
  id: string
  symbol: string
  quantity: number
  averagePrice: number
  totalCost: number
  createdAt: string
  updatedAt: string
}

export interface PortfolioTransaction {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  total: number
  fee?: number
  notes?: string
  createdAt: string
}

export interface UserPortfolio {
  userId: string
  positions: PortfolioPosition[]
  transactions: PortfolioTransaction[]
  updatedAt: string
}

const PORTFOLIO_FILE = join(process.cwd(), '.data', 'portfolio.json')

async function ensureDataDir() {
  const dataDir = join(process.cwd(), '.data')
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
}

async function loadPortfolios(): Promise<UserPortfolio[]> {
  await ensureDataDir()
  if (!existsSync(PORTFOLIO_FILE)) {
    return []
  }
  try {
    const content = await readFile(PORTFOLIO_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function savePortfolios(portfolios: UserPortfolio[]) {
  await ensureDataDir()
  await writeFile(PORTFOLIO_FILE, JSON.stringify(portfolios, null, 2), 'utf-8')
}

async function getUserPortfolio(userId: string): Promise<UserPortfolio> {
  const allPortfolios = await loadPortfolios()
  const userPortfolio = allPortfolios.find((p) => p.userId === userId)

  if (userPortfolio) {
    return userPortfolio
  }

  // Créer un portfolio par défaut si il n'existe pas
  const newPortfolio: UserPortfolio = {
    userId,
    positions: [],
    transactions: [],
    updatedAt: new Date().toISOString(),
  }

  allPortfolios.push(newPortfolio)
  await savePortfolios(allPortfolios)
  return newPortfolio
}

export async function getPortfolio(userId: string): Promise<UserPortfolio> {
  return getUserPortfolio(userId)
}

export async function addTransaction(
  userId: string,
  transaction: Omit<PortfolioTransaction, 'id' | 'createdAt'> & { createdAt?: string },
): Promise<PortfolioTransaction> {
  const allPortfolios = await loadPortfolios()
  let portfolio = allPortfolios.find((p) => p.userId === userId)

  if (!portfolio) {
    portfolio = {
      userId,
      positions: [],
      transactions: [],
      updatedAt: new Date().toISOString(),
    }
    allPortfolios.push(portfolio)
  }

  const { createdAt, ...txData } = transaction
  const newTransaction: PortfolioTransaction = {
    ...txData,
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: createdAt || new Date().toISOString(),
  }

  portfolio.transactions.push(newTransaction)

  // Mettre à jour les positions
  updatePositionsFromTransactions(portfolio)

  portfolio.updatedAt = new Date().toISOString()
  await savePortfolios(allPortfolios)

  return newTransaction
}

function updatePositionsFromTransactions(portfolio: UserPortfolio) {
  const positionMap = new Map<string, PortfolioPosition>()

  // Traiter les transactions dans l'ordre chronologique
  const sortedTransactions = [...portfolio.transactions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  for (const tx of sortedTransactions) {
    const existing = positionMap.get(tx.symbol)

    if (tx.type === 'buy') {
      if (existing) {
        const totalCost = existing.totalCost + tx.total
        const totalQuantity = existing.quantity + tx.quantity
        existing.averagePrice = totalCost / totalQuantity
        existing.quantity = totalQuantity
        existing.totalCost = totalCost
        existing.updatedAt = new Date().toISOString()
      } else {
        positionMap.set(tx.symbol, {
          id: `pos_${tx.symbol}_${Date.now()}`,
          symbol: tx.symbol,
          quantity: tx.quantity,
          averagePrice: tx.price,
          totalCost: tx.total,
          createdAt: tx.createdAt,
          updatedAt: tx.createdAt,
        })
      }
    } else if (tx.type === 'sell') {
      if (existing) {
        existing.quantity = Math.max(0, existing.quantity - tx.quantity)
        if (existing.quantity === 0) {
          positionMap.delete(tx.symbol)
        } else {
          // Recalculer le coût moyen (FIFO simplifié)
          existing.totalCost = existing.averagePrice * existing.quantity
          existing.updatedAt = new Date().toISOString()
        }
      }
    }
  }

  portfolio.positions = Array.from(positionMap.values())
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<Omit<PortfolioTransaction, 'id'>>,
): Promise<PortfolioTransaction | null> {
  const allPortfolios = await loadPortfolios()
  const portfolio = allPortfolios.find((p) => p.userId === userId)

  if (!portfolio) {
    return null
  }

  const index = portfolio.transactions.findIndex((t) => t.id === transactionId)
  if (index === -1) {
    return null
  }

  portfolio.transactions[index] = {
    ...portfolio.transactions[index],
    ...updates,
  }

  // Recalculer les positions
  updatePositionsFromTransactions(portfolio)

  portfolio.updatedAt = new Date().toISOString()
  await savePortfolios(allPortfolios)

  return portfolio.transactions[index]
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<boolean> {
  const allPortfolios = await loadPortfolios()
  const portfolio = allPortfolios.find((p) => p.userId === userId)

  if (!portfolio) {
    return false
  }

  const index = portfolio.transactions.findIndex((t) => t.id === transactionId)
  if (index === -1) {
    return false
  }

  portfolio.transactions.splice(index, 1)

  // Recalculer les positions
  updatePositionsFromTransactions(portfolio)

  portfolio.updatedAt = new Date().toISOString()
  await savePortfolios(allPortfolios)

  return true
}
