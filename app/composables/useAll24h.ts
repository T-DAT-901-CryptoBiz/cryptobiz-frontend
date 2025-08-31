import type { Ticker24h } from '~/types/binance'

export function useAll24h() {
  const { ticker24h } = useBinanceMarket()
  const rows = ref<Ticker24h[]>([])
  const pending = ref(true)

  const load = async () => {
    pending.value = true
    try {
      const r = await ticker24h()
      rows.value = (r.data.value ?? []) as Ticker24h[]
    } finally {
      pending.value = false
    }
  }

  onMounted(load)

  return { rows, pending, refresh: load }
}
