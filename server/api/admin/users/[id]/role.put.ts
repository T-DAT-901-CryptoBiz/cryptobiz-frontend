import { readBody } from 'h3'
import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { requireAdmin } from '../../../../utils/admin'
import { findUserById, updateUser } from '../../../../utils/users'

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
    const { role } = body

    if (role !== 'admin' && role !== 'user') {
      throw createError({
        statusCode: 400,
        message: 'Role must be "admin" or "user"',
      })
    }

    const user = await findUserById(id)
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    const updatedUser = await updateUser(id, { role })
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
    console.error(`[API /api/admin/users/${getRouterParam(event, 'id')}/role PUT] Error:`, error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
