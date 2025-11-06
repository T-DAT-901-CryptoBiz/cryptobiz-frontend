import { ref, computed } from 'vue'
import { useAll24h } from './useAll24h'
import { useSymbolsUniverse } from './useSymbolsUniverse'

export interface ConversionHistory {
  id: string
  fromSymbol: string
  toSymbol: string
  amount: number
  result: number
  rate: number
  timestamp: string
}

export function useCryptoConverter() {
  const { rows } = useAll24h()
  const { maps } = useSymbolsUniverse()
  const history = ref<ConversionHistory[]>([])

  // Get price for a symbol in USDC
  function getPriceInUSDC(symbol: string): number | null {
    const ticker = rows.value.find((r) => r.symbol === symbol)
    if (ticker) {
      return Number(ticker.lastPrice || 0)
    }
    return null
  }

  // Convert from one crypto to another
  function convert(
    fromSymbol: string,
    toSymbol: string,
    amount: number,
  ): { result: number; rate: number } | null {
    const fromPrice = getPriceInUSDC(fromSymbol)
    const toPrice = getPriceInUSDC(toSymbol)

    if (!fromPrice || !toPrice || fromPrice === 0 || toPrice === 0) {
      return null
    }

    // Convert via USDC: fromAmount * fromPrice / toPrice
    const result = (amount * fromPrice) / toPrice
    const rate = fromPrice / toPrice

    return { result, rate }
  }

  // Add to history
  function addToHistory(
    fromSymbol: string,
    toSymbol: string,
    amount: number,
    result: number,
    rate: number,
  ) {
    const conversion: ConversionHistory = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fromSymbol,
      toSymbol,
      amount,
      result,
      rate,
      timestamp: new Date().toISOString(),
    }

    history.value.unshift(conversion)
    // Keep only last 50 conversions
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50)
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('conversionHistory', JSON.stringify(history.value))
    }
  }

  // Load history from localStorage
  function loadHistory() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('conversionHistory')
      if (stored) {
        try {
          history.value = JSON.parse(stored)
        } catch {
          history.value = []
        }
      }
    }
  }

  // Clear history
  function clearHistory() {
    history.value = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('conversionHistory')
    }
  }

  // Get available symbols (USDC pairs)
  const availableSymbols = computed(() => {
    const symbols: Array<{ symbol: string; base: string }> = []
    for (const [symbol, base] of Object.entries(maps.value.base)) {
      if (symbol.endsWith('USDC')) {
        symbols.push({ symbol, base })
      }
    }
    return symbols.sort((a, b) => a.base.localeCompare(b.base))
  })

  return {
    convert,
    addToHistory,
    loadHistory,
    clearHistory,
    history,
    availableSymbols,
    getPriceInUSDC,
  }
}
