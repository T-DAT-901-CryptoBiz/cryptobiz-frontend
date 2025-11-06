import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { ApiRealtimeRow, OhlcvPoint, Interval } from '~/types/klines'

export interface UseKlinesRealtimeOptions {
  symbol: string
  interval?: Interval // par défaut '1m'
  limit?: number // par défaut 60
  pollMs?: number | false // e.g. 2000ms ; false = pas de polling
}

function mapRealtimeRow(row: ApiRealtimeRow): OhlcvPoint {
  const t = Date.parse(row.open_time) // on prend l'open_time pour l'axe X
  return {
    t,
    o: +row.open_price,
    h: +row.high_price,
    l: +row.low_price,
    c: +row.close_price,
    v: +row.volume_base,
  }
}

export function useKlinesRealtime(opts: UseKlinesRealtimeOptions) {
  const baseUrl = 'http://127.0.0.1:8004'

  const symbol = ref(opts.symbol)
  const interval = ref<Interval>(opts.interval ?? '1m')
  const limit = ref<number>(opts.limit ?? 60)
  const pollMs = ref<number | false>(opts.pollMs ?? 2000)

  const data = ref<OhlcvPoint[] | null>(null)
  const pending = ref(false)
  const error = ref<unknown>(null)

  const url = computed(
    () =>
      `${baseUrl}/api/v1/klines/${symbol.value}/${interval.value}/realtime?limit=${limit.value}`,
  )

  async function refresh() {
    pending.value = true
    error.value = null
    try {
      const raw = await $fetch<ApiRealtimeRow[]>(url.value)
      // L’API renvoie souvent en ordre décroissant (plus récent d’abord) → on trie ASC
      const rows = (raw ?? []).map(mapRealtimeRow).sort((a, b) => a.t - b.t)

      data.value = rows
    } catch (e) {
      error.value = e
      data.value = null
    } finally {
      pending.value = false
    }
  }

  // polling
  let timer: ReturnType<typeof setInterval> | null = null
  function start() {
    stop()
    if (pollMs.value && pollMs.value > 0) {
      timer = setInterval(() => {
        void refresh()
      }, pollMs.value)
    }
  }
  function stop() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  onMounted(() => {
    void refresh()
    start()
  })
  onBeforeUnmount(stop)

  // si props changent → refetch + restart polling
  watch([symbol, interval, limit, pollMs], () => {
    void refresh()
    start()
  })

  return { data, pending, error, symbol, interval, limit, pollMs, refresh, start, stop }
}
