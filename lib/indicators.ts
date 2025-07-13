// This file contains the JavaScript implementation of the Python indicator calculation code

export interface FinancialData {
  datetime: string | Date
  open: number
  high: number
  low: number
  close: number
  volume: number
  [key: string]: any
}

/**
 * Calculate technical indicators for financial data
 * JavaScript implementation of the Python add_indicators function
 */
export function calculateIndicators(data: FinancialData[]): FinancialData[] {
  if (!data || data.length === 0) return []

  const result = [...data]

  // Moving Averages
  calculateSMA(result, "close", 5, "sma_5")
  calculateSMA(result, "close", 10, "sma_10")
  calculateSMA(result, "close", 20, "sma_20")
  calculateSMA(result, "close", 50, "sma_50")
  calculateSMA(result, "close", 200, "sma_200")

  // Exponential Moving Averages
  calculateEMA(result, "close", 5, "ema_5")
  calculateEMA(result, "close", 10, "ema_10")
  calculateEMA(result, "close", 20, "ema_20")
  calculateEMA(result, "close", 50, "ema_50")
  calculateEMA(result, "close", 200, "ema_200")

  // MACD
  calculateEMA(result, "close", 12, "ema_12")
  calculateEMA(result, "close", 26, "ema_26")

  // Calculate MACD line
  for (let i = 0; i < result.length; i++) {
    if (result[i].ema_12 !== undefined && result[i].ema_26 !== undefined) {
      result[i].macd = result[i].ema_12 - result[i].ema_26
    }
  }

  // Calculate MACD signal line (9-day EMA of MACD)
  calculateEMA(result, "macd", 9, "macd_signal")

  // Calculate MACD histogram
  for (let i = 0; i < result.length; i++) {
    if (result[i].macd !== undefined && result[i].macd_signal !== undefined) {
      result[i].macd_hist = result[i].macd - result[i].macd_signal
    }
  }

  // RSI
  calculateRSI(result, "close", 14, "rsi")

  // Bollinger Bands
  calculateBollingerBands(result, "close", 20)

  // Average True Range (ATR)
  calculateATR(result, 14)

  // Momentum
  for (let i = 10; i < result.length; i++) {
    result[i].momentum = (result[i].close / result[i - 10].close) * 100
  }

  // Rate of Change
  for (let i = 12; i < result.length; i++) {
    result[i].roc = (result[i].close / result[i - 12].close - 1) * 100
  }

  // Volume Moving Average
  calculateSMA(result, "volume", 20, "volume_sma")

  // Price to Moving Average Ratios
  for (let i = 0; i < result.length; i++) {
    if (result[i].sma_20 !== undefined) {
      result[i].price_to_sma_20 = result[i].close / result[i].sma_20
    }
    if (result[i].sma_50 !== undefined) {
      result[i].price_to_sma_50 = result[i].close / result[i].sma_50
    }
  }

  // Moving Average Convergence/Divergence
  for (let i = 0; i < result.length; i++) {
    if (result[i].sma_20 !== undefined && result[i].sma_50 !== undefined) {
      result[i].sma_20_50_cross = result[i].sma_20 > result[i].sma_50 ? 1 : 0
    }
  }

  // Relative volatility
  for (let i = 20; i < result.length; i++) {
    const prices = result.slice(i - 20, i).map((d) => d.close)
    const std = calculateStandardDeviation(prices)
    result[i].volatility = (std / result[i].close) * 100
  }

  // Price distance from highest/lowest
  for (let i = 20; i < result.length; i++) {
    const highPrices = result.slice(i - 20, i).map((d) => d.high)
    const lowPrices = result.slice(i - 20, i).map((d) => d.low)
    const maxHigh = Math.max(...highPrices)
    const minLow = Math.min(...lowPrices)

    result[i].dist_from_high_20 = result[i].close / maxHigh
    result[i].dist_from_low_20 = result[i].close / minLow
  }

  // Remove entries with undefined values
  return result.filter((row) => row.sma_20 !== undefined)
}

// Helper functions

function calculateSMA(data: FinancialData[], field: string, period: number, targetField: string): void {
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, curr) => acc + curr[field], 0)
    data[i][targetField] = sum / period
  }
}

function calculateEMA(data: FinancialData[], field: string, period: number, targetField: string): void {
  // First value is SMA
  let sum = 0
  for (let i = 0; i < period; i++) {
    if (data[i] && data[i][field] !== undefined) {
      sum += data[i][field]
    }
  }

  if (data[period - 1]) {
    data[period - 1][targetField] = sum / period
  }

  // Calculate multiplier
  const multiplier = 2 / (period + 1)

  // Calculate EMA for remaining periods
  for (let i = period; i < data.length; i++) {
    if (data[i][field] !== undefined && data[i - 1][targetField] !== undefined) {
      data[i][targetField] = data[i][field] * multiplier + data[i - 1][targetField] * (1 - multiplier)
    }
  }
}

function calculateRSI(data: FinancialData[], field: string, period: number, targetField: string): void {
  // Calculate price changes
  const changes = []
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i][field] - data[i - 1][field])
  }

  // Calculate average gains and losses
  let avgGain = 0
  let avgLoss = 0

  // First RSI value
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i]
    } else {
      avgLoss += Math.abs(changes[i])
    }
  }

  avgGain /= period
  avgLoss /= period

  // Set first RSI value
  if (avgLoss === 0) {
    data[period][targetField] = 100
  } else {
    const rs = avgGain / avgLoss
    data[period][targetField] = 100 - 100 / (1 + rs)
  }

  // Calculate remaining RSI values
  for (let i = period + 1; i < data.length; i++) {
    const change = changes[i - 1]
    let gain = 0
    let loss = 0

    if (change > 0) {
      gain = change
    } else {
      loss = Math.abs(change)
    }

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    if (avgLoss === 0) {
      data[i][targetField] = 100
    } else {
      const rs = avgGain / avgLoss
      data[i][targetField] = 100 - 100 / (1 + rs)
    }
  }
}

function calculateBollingerBands(data: FinancialData[], field: string, period: number): void {
  // Calculate SMA (middle band)
  calculateSMA(data, field, period, "bollinger_mid")

  // Calculate standard deviation
  for (let i = period - 1; i < data.length; i++) {
    const values = data.slice(i - period + 1, i + 1).map((d) => d[field])
    const std = calculateStandardDeviation(values)

    data[i].bollinger_std = std
    data[i].bollinger_upper = data[i].bollinger_mid + 2 * std
    data[i].bollinger_lower = data[i].bollinger_mid - 2 * std
  }
}

function calculateATR(data: FinancialData[], period: number): void {
  // Calculate True Range
  for (let i = 1; i < data.length; i++) {
    const tr1 = data[i].high - data[i].low
    const tr2 = Math.abs(data[i].high - data[i - 1].close)
    const tr3 = Math.abs(data[i].low - data[i - 1].close)

    data[i].tr = Math.max(tr1, tr2, tr3)
  }

  // Calculate ATR
  let sum = 0
  for (let i = 1; i <= period; i++) {
    sum += data[i].tr
  }

  data[period].atr = sum / period

  // Calculate remaining ATR values
  for (let i = period + 1; i < data.length; i++) {
    data[i].atr = (data[i - 1].atr * (period - 1) + data[i].tr) / period
  }
}

function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  return Math.sqrt(variance)
}
