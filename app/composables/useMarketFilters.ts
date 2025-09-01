export function useMarketFilters() {
  const q = useState<string>('mk:q', () => '')
  const quote = useState<string>('mk:quote', () => 'ALL')
  const onlyWatchlist = useState<boolean>('mk:onlyWatch', () => false)
  const autoRefreshMs = useState<number>('mk:auto', () => 0)

  return { q, quote, onlyWatchlist, autoRefreshMs }
}
