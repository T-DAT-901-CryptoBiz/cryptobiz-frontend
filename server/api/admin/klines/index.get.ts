import type { H3Event } from 'h3'
import { requireAdmin } from '../../../utils/admin'

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const klineApiUrl = config.klineApiUrl || 'http://127.0.0.1:8004'

  try {
    const query = getQuery(event)
    const symbol = (query.symbol as string) || 'BTCUSDT'
    const interval = (query.interval as string) || '1h'
    const limit = Number(query.limit) || 100

    // Construire l'URL de l'API externe
    const baseUrl = `${klineApiUrl}/api/v1/klines/${symbol}/${interval}/ohlcv`
    const params = new URLSearchParams()
    params.set('limit', String(limit))
    if (query.from) params.set('from', String(query.from))
    if (query.to) params.set('to', String(query.to))
    if (query.order) params.set('order', String(query.order))

    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl

    // L'API retourne un format OHLCV selon la documentation
    const response = await $fetch<
      Array<{
        timestamp?: number
        open_time?: string
        open?: number
        open_price?: number
        high?: number
        high_price?: number
        low?: number
        low_price?: number
        close?: number
        close_price?: number
        volume?: number
        volume_base?: number
      }>
    >(url)

    // Normaliser les données pour un format uniforme
    const normalizedKlines = response.map((kline) => {
      // Gérer différents formats de timestamp
      let timestamp = 0
      if (kline.timestamp) {
        // Si timestamp est en millisecondes, le convertir en secondes
        timestamp = kline.timestamp > 1e12 ? Math.floor(kline.timestamp / 1000) : kline.timestamp
      } else if (kline.open_time) {
        timestamp = Math.floor(new Date(kline.open_time).getTime() / 1000)
      }

      return {
        timestamp,
        open_price: kline.open_price || kline.open || 0,
        high_price: kline.high_price || kline.high || 0,
        low_price: kline.low_price || kline.low || 0,
        close_price: kline.close_price || kline.close || 0,
        volume_base: kline.volume_base || kline.volume || 0,
      }
    })

    return {
      symbol,
      interval,
      klines: normalizedKlines,
      count: normalizedKlines.length,
    }
  } catch (error) {
    console.error('[API /api/admin/klines GET] Error:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: `Failed to fetch klines from external API: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }
})
