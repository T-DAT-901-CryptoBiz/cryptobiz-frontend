import { getRouterParam } from 'h3'
import type { H3Event } from 'h3'
import { requireAdmin } from '../../../utils/admin'
import { findUserById } from '../../../utils/users'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { getAuthSession } from '../../../utils/session'

async function loadAllUsers() {
  const USERS_FILE = join(process.cwd(), '.data', 'users.json')
  const dataDir = join(process.cwd(), '.data')

  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

  if (!existsSync(USERS_FILE)) {
    return []
  }

  try {
    const content = await readFile(USERS_FILE, 'utf-8')
    const users = JSON.parse(content) as Array<{
      id: string
      role?: string
      [key: string]: unknown
    }>
    return users.map((user) => {
      if (!user.role) {
        return { ...user, role: 'user' }
      }
      return user
    })
  } catch {
    return []
  }
}

async function saveUsers(users: Array<{ id: string; [key: string]: unknown }>) {
  const USERS_FILE = join(process.cwd(), '.data', 'users.json')
  const dataDir = join(process.cwd(), '.data')

  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }

  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  try {
    const session = getAuthSession(event)
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required',
      })
    }

    // Empêcher la suppression de son propre compte
    if (session && session.userId === id) {
      throw createError({
        statusCode: 400,
        message: 'You cannot delete your own account',
      })
    }

    const user = await findUserById(id)
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    const allUsers = await loadAllUsers()
    const index = allUsers.findIndex((u) => u.id === id)

    if (index === -1) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    allUsers.splice(index, 1)
    await saveUsers(allUsers)

    return { success: true }
  } catch (error) {
    console.error(`[API /api/admin/users/${getRouterParam(event, 'id')} DELETE] Error:`, error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
