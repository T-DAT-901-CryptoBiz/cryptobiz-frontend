import { setCookie, getCookie, deleteCookie } from 'h3'
import type { H3Event } from 'h3'

const SESSION_COOKIE_NAME = 'auth_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 jours

export interface SessionData {
  userId: string
  email: string
}

export function setSession(event: H3Event, data: SessionData) {
  setCookie(event, SESSION_COOKIE_NAME, JSON.stringify(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export function getAuthSession(event: H3Event): SessionData | null {
  const cookie = getCookie(event, SESSION_COOKIE_NAME)
  if (!cookie) return null
  try {
    return JSON.parse(cookie) as SessionData
  } catch {
    return null
  }
}

export function clearAuthSession(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}
