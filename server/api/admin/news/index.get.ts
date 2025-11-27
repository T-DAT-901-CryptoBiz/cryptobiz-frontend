import type { H3Event } from 'h3'
import { requireAdmin } from '../../../utils/admin'

export default defineEventHandler(async (event: H3Event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const klineApiUrl = config.klineApiUrl || 'http://127.0.0.1:8004'

  try {
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const perPage = Number(query.per_page) || 50
    const search = query.search as string | undefined
    const category = query.category as string | undefined
    const dateFrom = query.date_from as string | undefined

    // Construire l'URL de l'API externe
    const baseUrl = `${klineApiUrl}/api/v1/articles`
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('per_page', String(perPage))
    if (search) params.set('search', search)
    if (category) params.set('category', category)
    if (dateFrom) params.set('date_from', dateFrom)

    const url = `${baseUrl}?${params.toString()}`

    const response = await $fetch<{
      articles: Array<{
        id: number
        title: string
        link: string
        description?: string | null
        category?: string | null
        rss_source?: string | null
        publish_date: string
        create_time?: string
        image_url?: string | null
        tickers?: string[] | null
        score?: number | null
      }>
      total: number
      page: number
      per_page: number
    }>(url)

    return response
  } catch (error) {
    console.error('[API /api/admin/news GET] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch news from external API',
    })
  }
})
