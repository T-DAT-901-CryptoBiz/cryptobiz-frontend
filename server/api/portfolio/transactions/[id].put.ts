import { readBody } from 'h3'
import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { getAuthSession } from '../../../utils/session'
import { updateTransaction } from '../../../utils/portfolio'

export default defineEventHandler(async (event: H3Event) => {
  const session = getAuthSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Transaction ID is required',
    })
  }

  const body = await readBody(event)
  const { symbol, type, quantity, price, fee, notes, createdAt } = body

  const updates: Record<string, unknown> = {}
  if (symbol !== undefined) updates.symbol = symbol.toUpperCase()
  if (type !== undefined) {
    if (type !== 'buy' && type !== 'sell') {
      throw createError({
        statusCode: 400,
        message: 'Type must be "buy" or "sell"',
      })
    }
    updates.type = type
  }
  if (quantity !== undefined) {
    if (quantity <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Quantity must be positive',
      })
    }
    updates.quantity = Number(quantity)
  }
  if (price !== undefined) {
    if (price <= 0) {
      throw createError({
        statusCode: 400,
        message: 'Price must be positive',
      })
    }
    updates.price = Number(price)
  }
  if (fee !== undefined) updates.fee = fee ? Number(fee) : undefined
  if (notes !== undefined) updates.notes = notes || undefined
  if (createdAt !== undefined) updates.createdAt = createdAt

  // Recalculer le total si quantity ou price changent
  if (updates.quantity !== undefined || updates.price !== undefined) {
    const finalQuantity = updates.quantity ?? body.originalQuantity ?? 0
    const finalPrice = updates.price ?? body.originalPrice ?? 0
    const finalFee = updates.fee ?? body.originalFee ?? 0
    updates.total = finalQuantity * finalPrice + finalFee
  }

  const transaction = await updateTransaction(session.userId, id, updates)

  if (!transaction) {
    throw createError({
      statusCode: 404,
      message: 'Transaction not found',
    })
  }

  return { transaction }
})
