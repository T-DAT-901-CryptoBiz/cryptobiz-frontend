import { readBody } from 'h3'
import type { H3Event } from 'h3'
import { findUserByEmail, createUser } from '../../utils/users'
import { setSession } from '../../utils/session'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    const { email, password, name } = body

    // Validation
    if (!email || !password || !name) {
      throw createError({
        statusCode: 400,
        message: 'Email, password and name are required',
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
    })

    // Créer la session
    setSession(event, {
      userId: user.id,
      email: user.email,
    })

    // Retourner l'utilisateur (sans le password)
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    return {
      user: userWithoutPassword,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
