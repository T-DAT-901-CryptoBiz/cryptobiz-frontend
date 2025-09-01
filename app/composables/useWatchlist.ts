export function useWatchlist() {
  const key = 'cryptoview:watchlist'
  const list = useState<string[]>('watchlist', () => {
    if (process.client) {
      const raw = localStorage.getItem(key)
      if (raw) return JSON.parse(raw)
    }
    return ['BTCUSDT', 'ETHUSDT', 'XRPUSDT']
  })

  const save = () => {
    if (process.client) localStorage.setItem(key, JSON.stringify(list.value))
  }
  const add = (s: string) => {
    if (!list.value.includes(s)) {
      list.value.push(s)
      save()
    }
  }
  const remove = (s: string) => {
    list.value = list.value.filter((x) => x !== s)
    save()
  }
  const toggle = (s: string) => (list.value.includes(s) ? remove(s) : add(s))

  return { list, add, remove, toggle }
}
