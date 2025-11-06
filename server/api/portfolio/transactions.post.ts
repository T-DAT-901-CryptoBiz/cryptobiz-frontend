import { readBody } from 'h3'
import type { H3Event } from 'h3'
import { getAuthSession } from '../../utils/session'
import { addTransaction } from '../../utils/portfolio'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const { symbol, type, quantity, price, fee, notes, date } = body

  // Validation
  if (!symbol || !type || !quantity || !price) {
    throw createError({
      statusCode: 400,
      message: 'Symbol, type, quantity and price are required',
    })
  }

  if (type !== 'buy' && type !== 'sell') {
    throw createError({
      statusCode: 400,
      message: 'Type must be "buy" or "sell"',
    })
  }

  if (quantity <= 0 || price <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Quantity and price must be positive',
    })
  }

  const total = quantity * price + (fee || 0)

  const transaction = await addTransaction(session.userId, {
    symbol: symbol.toUpperCase(),
    type,
    quantity: Number(quantity),
    price: Number(price),
    total,
    fee: fee ? Number(fee) : undefined,
    notes: notes || undefined,
    createdAt: date || undefined,
  })

  return { transaction }
})
