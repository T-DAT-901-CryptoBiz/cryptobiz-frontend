import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  email: string
  password?: string // hashé, peut être undefined pour OAuth
  name: string
  picture?: string
  provider: 'local' | 'google'
  googleId?: string
  createdAt: string
  updatedAt: string
}

const USERS_FILE = join(process.cwd(), '.data', 'users.json')

async function ensureDataDir() {
  const dataDir = join(process.cwd(), '.data')
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
}

async function loadUsers(): Promise<User[]> {
  await ensureDataDir()
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

async function saveUsers(users: User[]) {
  await ensureDataDir()
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await loadUsers()
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await loadUsers()
  return users.find((u) => u.id === id) || null
}

export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  const users = await loadUsers()
  return users.find((u) => u.googleId === googleId) || null
}

export async function createUser(data: {
  email: string
  password?: string
  name: string
  picture?: string
  provider: 'local' | 'google'
  googleId?: string
}): Promise<User> {
  const users = await loadUsers()
  const now = new Date().toISOString()

  // Hash password si fourni
  let hashedPassword: string | undefined
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10)
  }

  const user: User = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    email: data.email.toLowerCase(),
    password: hashedPassword,
    name: data.name,
    picture: data.picture,
    provider: data.provider,
    googleId: data.googleId,
    createdAt: now,
    updatedAt: now,
  }

  users.push(user)
  await saveUsers(users)
  return user
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = await loadUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index === -1) return null

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  await saveUsers(users)
  return users[index]
}
