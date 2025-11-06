import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export interface UserFavorites {
  userId: string
  crypto: string[] // symboles de cryptos (ex: ['BTCUSDT', 'ETHUSDT'])
  news: number[] // IDs des articles/news
  updatedAt: string
}

const FAVORITES_FILE = join(process.cwd(), '.data', 'favorites.json')

async function ensureDataDir() {
  const dataDir = join(process.cwd(), '.data')
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
}

async function loadFavorites(): Promise<UserFavorites[]> {
  await ensureDataDir()
  if (!existsSync(FAVORITES_FILE)) {
    return []
  }
  try {
    const content = await readFile(FAVORITES_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

async function saveFavorites(favorites: UserFavorites[]) {
  await ensureDataDir()
  await writeFile(FAVORITES_FILE, JSON.stringify(favorites, null, 2), 'utf-8')
}

async function getUserFavorites(userId: string): Promise<UserFavorites> {
  const allFavorites = await loadFavorites()
  const userFav = allFavorites.find((f) => f.userId === userId)

  if (userFav) {
    return userFav
  }

  // Créer une entrée par défaut si elle n'existe pas
  const newFav: UserFavorites = {
    userId,
    crypto: [],
    news: [],
    updatedAt: new Date().toISOString(),
  }

  allFavorites.push(newFav)
  await saveFavorites(allFavorites)
  return newFav
}

export async function getCryptoFavorites(userId: string): Promise<string[]> {
  const fav = await getUserFavorites(userId)
  return fav.crypto
}

export async function addCryptoFavorite(userId: string, symbol: string): Promise<void> {
  const allFavorites = await loadFavorites()
  const index = allFavorites.findIndex((f) => f.userId === userId)

  if (index === -1) {
    allFavorites.push({
      userId,
      crypto: [symbol],
      news: [],
      updatedAt: new Date().toISOString(),
    })
  } else {
    if (!allFavorites[index].crypto.includes(symbol)) {
      allFavorites[index].crypto.push(symbol)
      allFavorites[index].updatedAt = new Date().toISOString()
    }
  }

  await saveFavorites(allFavorites)
}

export async function removeCryptoFavorite(userId: string, symbol: string): Promise<void> {
  const allFavorites = await loadFavorites()
  const index = allFavorites.findIndex((f) => f.userId === userId)

  if (index !== -1) {
    allFavorites[index].crypto = allFavorites[index].crypto.filter((s) => s !== symbol)
    allFavorites[index].updatedAt = new Date().toISOString()
    await saveFavorites(allFavorites)
  }
}

export async function getNewsFavorites(userId: string): Promise<number[]> {
  const fav = await getUserFavorites(userId)
  return fav.news
}

export async function addNewsFavorite(userId: string, newsId: number): Promise<void> {
  const allFavorites = await loadFavorites()
  const index = allFavorites.findIndex((f) => f.userId === userId)

  if (index === -1) {
    allFavorites.push({
      userId,
      crypto: [],
      news: [newsId],
      updatedAt: new Date().toISOString(),
    })
  } else {
    if (!allFavorites[index].news.includes(newsId)) {
      allFavorites[index].news.push(newsId)
      allFavorites[index].updatedAt = new Date().toISOString()
    }
  }

  await saveFavorites(allFavorites)
}

export async function removeNewsFavorite(userId: string, newsId: number): Promise<void> {
  const allFavorites = await loadFavorites()
  const index = allFavorites.findIndex((f) => f.userId === userId)

  if (index !== -1) {
    allFavorites[index].news = allFavorites[index].news.filter((id) => id !== newsId)
    allFavorites[index].updatedAt = new Date().toISOString()
    await saveFavorites(allFavorites)
  }
}
