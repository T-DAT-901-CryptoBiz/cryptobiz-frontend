import type { H3Event } from 'h3'
import { OAuth2Client } from 'google-auth-library'
import { findUserByGoogleId, findUserByEmail, createUser, updateUser } from '../../utils/users'
import { setSession } from '../../utils/session'

const config = useRuntimeConfig()

export default defineEventHandler(async (event: H3Event) => {
  try {
    const query = getQuery(event)
    const code = query.code as string

    // Construire l'URI de redirection de manière cohérente
    // Google exige que l'URI de redirection corresponde exactement à celle configurée
    const host = getHeader(event, 'host') || 'localhost:3000'
    const protocol =
      getHeader(event, 'x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
    const redirectUri = `${protocol}://${host}/api/auth/google`

    if (!code) {
      // Rediriger vers Google OAuth
      const googleClientId = config.googleClientId
      const googleClientSecret = config.googleClientSecret

      if (!googleClientId || !googleClientSecret) {
        // Rediriger vers la page de login avec un message d'erreur
        return sendRedirect(
          event,
          `/login?error=${encodeURIComponent("Google OAuth n'est pas configuré. Veuillez contacter l'administrateur.")}`,
        )
      }

      // Vérifier si ce sont encore les valeurs par défaut
      if (
        googleClientId.includes('your-client-id') ||
        googleClientSecret.includes('your-client-secret')
      ) {
        return sendRedirect(
          event,
          `/login?error=${encodeURIComponent("Google OAuth n'est pas correctement configuré. Vérifiez votre fichier .env.")}`,
        )
      }

      const client = new OAuth2Client(googleClientId, googleClientSecret, redirectUri)

      const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        prompt: 'consent',
      })

      return sendRedirect(event, authUrl)
    }

    // Échanger le code contre un token
    const googleClientId = config.googleClientId
    const googleClientSecret = config.googleClientSecret

    if (!googleClientId || !googleClientSecret) {
      // Rediriger vers la page de login avec un message d'erreur
      return sendRedirect(
        event,
        `/login?error=${encodeURIComponent("Google OAuth n'est pas configuré. Veuillez contacter l'administrateur.")}`,
      )
    }

    // Utiliser la même URI de redirection que celle utilisée pour générer l'URL d'autorisation
    const client = new OAuth2Client(googleClientId, googleClientSecret, redirectUri)

    const { tokens } = await client.getToken(code)
    client.setCredentials(tokens)

    // Obtenir les informations utilisateur
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token || '',
      audience: googleClientId,
    })

    const payload = ticket.getPayload()
    if (!payload) {
      throw createError({
        statusCode: 401,
        message: 'Failed to verify Google token',
      })
    }

    const googleId = payload.sub
    const email = payload.email
    const name = payload.name || payload.email?.split('@')[0] || 'User'
    const picture = payload.picture

    if (!googleId || !email) {
      throw createError({
        statusCode: 400,
        message: 'Invalid Google account data',
      })
    }

    // Chercher ou créer l'utilisateur
    let user = await findUserByGoogleId(googleId)

    if (!user) {
      // Vérifier si un utilisateur avec cet email existe déjà
      const existingUser = await findUserByEmail(email)
      if (existingUser) {
        // Lier le compte Google à l'utilisateur existant
        user =
          (await updateUser(existingUser.id, {
            googleId,
            picture: picture || existingUser.picture,
            provider: 'google',
          })) || existingUser
      } else {
        // Créer un nouvel utilisateur
        user = await createUser({
          email,
          name,
          picture,
          provider: 'google',
          googleId,
          role: 'user',
        })
      }
    }

    // Créer la session
    setSession(event, {
      userId: user.id,
      email: user.email,
    })

    // Rediriger vers la page d'origine ou dashboard
    return sendRedirect(event, '/')
  } catch (error: unknown) {
    console.error('Google OAuth error:', error)

    // Si OAuth n'est pas configuré, rediriger vers login avec un message
    const googleClientId = config.googleClientId
    const googleClientSecret = config.googleClientSecret
    if (!googleClientId || !googleClientSecret) {
      return sendRedirect(
        event,
        `/login?error=${encodeURIComponent("Google OAuth n'est pas configuré. Veuillez contacter l'administrateur.")}`,
      )
    }

    // Pour les autres erreurs, rediriger vers login avec un message générique
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode?: number }).statusCode
      if (statusCode === 401 || statusCode === 400) {
        return sendRedirect(
          event,
          `/login?error=${encodeURIComponent("Échec de l'authentification Google. Veuillez réessayer.")}`,
        )
      }
    }

    return sendRedirect(
      event,
      `/login?error=${encodeURIComponent("Erreur lors de l'authentification Google. Veuillez réessayer.")}`,
    )
  }
})
