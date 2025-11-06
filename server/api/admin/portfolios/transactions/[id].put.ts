import { readBody } from 'h3'
import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { requireAdmin } from '../../../../utils/admin'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

async function loadAllPortfolios() {
  const PORTFOLIO_FILE = join(process.cwd(), '.data', 'portfolio.json')
  const dataDir = join(process.cwd(), '.data')

  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

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

interface Portfolio {
  userId: string
  transactions?: Array<{
    id: string
    symbol: string
    type: 'buy' | 'sell'
    quantity: number
    price: number
    total: number
    fee?: number
    notes?: string
    createdAt: string
    [key: string]: unknown
  }>
  updatedAt: string
  [key: string]: unknown
}

async function savePortfolios(portfolios: Portfolio[]) {
  const PORTFOLIO_FILE = join(process.cwd(), '.data', 'portfolio.json')
  const dataDir = join(process.cwd(), '.data')

  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

  await writeFile(PORTFOLIO_FILE, JSON.stringify(portfolios, null, 2), 'utf-8')
}

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'Transaction ID is required',
      })
    }

    const body = await readBody(event)
    const allPortfolios = await loadAllPortfolios()

    let transactionFound = false
    for (const portfolio of allPortfolios) {
      const transaction = portfolio.transactions?.find((t) => t.id === id)
      if (transaction) {
        transactionFound = true

        const updates: Record<string, unknown> = {}

        if (body.symbol !== undefined) updates.symbol = body.symbol.toUpperCase()
        if (body.type !== undefined) {
          if (body.type !== 'buy' && body.type !== 'sell') {
            throw createError({
              statusCode: 400,
              message: 'Type must be "buy" or "sell"',
            })
          }
          updates.type = body.type
        }
        if (body.quantity !== undefined) updates.quantity = Number(body.quantity)
        if (body.price !== undefined) updates.price = Number(body.price)
        if (body.total !== undefined) updates.total = Number(body.total)
        if (body.fee !== undefined) updates.fee = body.fee === null ? undefined : Number(body.fee)
        if (body.notes !== undefined) updates.notes = body.notes
        if (body.createdAt !== undefined) updates.createdAt = body.createdAt

        Object.assign(transaction, updates)

        portfolio.updatedAt = new Date().toISOString()
        break
      }
    }

    if (!transactionFound) {
      throw createError({
        statusCode: 404,
        message: 'Transaction not found',
      })
    }

    await savePortfolios(allPortfolios)

    // Retourner la transaction mise à jour
    for (const portfolio of allPortfolios) {
      const transaction = portfolio.transactions?.find((t) => t.id === id)
      if (transaction) {
        return { transaction }
      }
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update transaction',
    })
  } catch (error) {
    console.error(
      `[API /api/admin/portfolios/transactions/${getRouterParam(event, 'id')} PUT] Error:`,
      error,
    )
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
