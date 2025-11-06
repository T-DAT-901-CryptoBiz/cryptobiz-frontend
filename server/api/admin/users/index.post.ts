import { readBody } from 'h3'
import type { H3Event } from 'h3'
import { requireAdmin } from '../../../utils/admin'
import { findUserByEmail, createUser } from '../../../utils/users'

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  try {
    const body = await readBody(event)
    const { name, email, password, role } = body

    // Validation
    if (!name || !email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Name, email and password are required',
      })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email format',
      })
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        message: 'Password must be at least 6 characters',
      })
    }

    if (role && role !== 'admin' && role !== 'user') {
      throw createError({
        statusCode: 400,
        message: 'Role must be "admin" or "user"',
      })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      throw createError({
        statusCode: 409,
        message: 'User already exists',
      })
    }

    // Créer l'utilisateur
    const user = await createUser({
      email,
      password,
      name,
      provider: 'local',
      role: role || 'user',
    })

    // Retourner l'utilisateur (sans le password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _unused, ...userWithoutPassword } = user
    return { user: userWithoutPassword }
  } catch (error) {
    console.error('[API /api/admin/users POST] Error:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
