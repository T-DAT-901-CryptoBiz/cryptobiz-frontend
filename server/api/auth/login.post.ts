import { readBody } from 'h3'
import type { H3Event } from 'h3'
import { findUserByEmail, verifyPassword } from '../../utils/users'
import { setSession } from '../../utils/session'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    // Validation
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        message: 'Email and password are required',
      })
    }

    // Trouver l'utilisateur
    const user = await findUserByEmail(email)
    if (!user || !user.password) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials',
      })
    }

    // Vérifier le password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      throw createError({
        statusCode: 401,
        message: 'Invalid credentials',
      })
    }

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
