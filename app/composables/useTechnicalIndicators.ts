export interface TechnicalIndicator {
  name: string
  values: number[]
  color: string
}

export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN)
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / period)
    }
  }
  return result
}

export function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = []
  const multiplier = 2 / (period + 1)
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[i])
    } else {
      result.push((data[i] - result[i - 1]) * multiplier + result[i - 1])
    }
  }
  return result
}

export function calculateRSI(data: number[], period = 14): number[] {
  const result: number[] = []
  const changes: number[] = []

  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1])
  }

  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN)
    } else {
      const periodChanges = changes.slice(i - period, i)
      const gains = periodChanges.filter((c) => c > 0).reduce((a, b) => a + b, 0) / period
      const losses =
        Math.abs(periodChanges.filter((c) => c < 0).reduce((a, b) => a + b, 0)) / period
      const rs = gains / (losses || 1)
      result.push(100 - 100 / (1 + rs))
    }
  }

  return result
}

export function calculateBollingerBands(
  data: number[],
  period = 20,
  stdDev = 2,
): { upper: number[]; middle: number[]; lower: number[] } {
  const sma = calculateSMA(data, period)
  const upper: number[] = []
  const lower: number[] = []

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN)
      lower.push(NaN)
    } else {
      const slice = data.slice(i - period + 1, i + 1)
      const mean = sma[i]
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period
      const std = Math.sqrt(variance)
      upper.push(mean + stdDev * std)
      lower.push(mean - stdDev * std)
    }
  }

  return { upper, middle: sma, lower }
}

export function calculateMACD(
  data: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(data, fastPeriod)
  const slowEMA = calculateEMA(data, slowPeriod)
  const macd = fastEMA.map((fast, i) => fast - slowEMA[i])
  const signal = calculateEMA(macd, signalPeriod)
  const histogram = macd.map((m, i) => m - signal[i])

  return { macd, signal, histogram }
}
