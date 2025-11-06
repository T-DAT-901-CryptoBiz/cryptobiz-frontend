import { readBody } from 'h3'
import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { requireAdmin } from '../../../utils/admin'
import { findUserById, updateUser } from '../../../utils/users'

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required',
      })
    }

    const body = await readBody(event)
    const updates: Record<string, unknown> = {}

    if (body.name !== undefined) updates.name = body.name
    if (body.email !== undefined) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        throw createError({
          statusCode: 400,
          message: 'Invalid email format',
        })
      }
      updates.email = body.email.toLowerCase()
    }
    if (body.role !== undefined) {
      if (body.role !== 'admin' && body.role !== 'user') {
        throw createError({
          statusCode: 400,
          message: 'Role must be "admin" or "user"',
        })
      }
      updates.role = body.role
    }

    const user = await findUserById(id)
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    const updatedUser = await updateUser(id, updates)
    if (!updatedUser) {
      throw createError({
        statusCode: 500,
        message: 'Failed to update user',
      })
    }

    // Retourner l'utilisateur sans le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = updatedUser
    return { user: userWithoutPassword }
  } catch (error) {
    console.error(`[API /api/admin/users/${getRouterParam(event, 'id')} PUT] Error:`, error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
