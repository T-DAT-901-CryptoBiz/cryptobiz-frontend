import type { H3Event } from 'h3'
import { requireAdmin } from '../../../utils/admin'
import type { User } from '../../../utils/users'

async function loadAllUsers() {
  const { readFile, mkdir } = await import('fs/promises')
  const { existsSync } = await import('fs')
  const { join } = await import('path')

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
    return JSON.parse(content)
  } catch {
    return []
  }
}

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  try {
    const allUsers = (await loadAllUsers()) as User[]
    // Retourner les utilisateurs sans les mots de passe
    const usersWithoutPasswords = allUsers.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user
      return userWithoutPassword
    })
    return { users: usersWithoutPasswords }
  } catch (error) {
    console.error('[API /api/admin/users GET] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Internal server error',
    })
  }
})
