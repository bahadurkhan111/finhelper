"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react"

interface PatternDetectionProps {
  data: any[]
}

interface Pattern {
  id: string
  name: string
  description: string
  type: "bullish" | "bearish" | "neutral"
  locations: number[]
}

export default function PatternDetection({ data }: PatternDetectionProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [enabledPatterns, setEnabledPatterns] = useState<Record<string, boolean>>({
    doji: true,
    hammer: true,
    engulfing: true,
    macd_cross: true,
    golden_cross: true,
    death_cross: true,
    overbought: true,
    oversold: true,
  })

  useEffect(() => {
    if (data.length === 0) return

    // Detect patterns in the data
    const detectedPatterns: Pattern[] = []

    // Only run detection if we have enough data
    if (data.length > 30) {
      // Detect Doji candles (open and close are very close)
      if (enabledPatterns.doji) {
        for (let i = 0; i < data.length; i++) {
          const openCloseRatio = Math.abs(data[i].open - data[i].close) / (data[i].high - data[i].low)
          if (openCloseRatio < 0.1 && data[i].high - data[i].low > 1.5 * Math.abs(data[i].open - data[i].close)) {
            detectedPatterns.push({
              id: `doji-${i}`,
              name: "Doji",
              description: "Indecision in the market, potential reversal signal",
              type: "neutral",
              locations: [i],
            })
          }
        }
      }

      // Detect Hammer pattern
      if (enabledPatterns.hammer) {
        for (let i = 0; i < data.length; i++) {
          const bodySize = Math.abs(data[i].open - data[i].close)
          const lowerShadow = Math.min(data[i].open, data[i].close) - data[i].low
          const upperShadow = data[i].high - Math.max(data[i].open, data[i].close)

          if (lowerShadow > 2 * bodySize && upperShadow < 0.1 * bodySize && data[i].close > data[i].open) {
            detectedPatterns.push({
              id: `hammer-${i}`,
              name: "Hammer",
              description: "Potential bullish reversal pattern",
              type: "bullish",
              locations: [i],
            })
          }
        }
      }

      // Detect Bullish/Bearish Engulfing
      if (enabledPatterns.engulfing) {
        for (let i = 1; i < data.length; i++) {
          // Bullish engulfing
          if (
            data[i - 1].close < data[i - 1].open && // Previous candle is bearish
            data[i].close > data[i].open && // Current candle is bullish
            data[i].open < data[i - 1].close && // Current open is lower than previous close
            data[i].close > data[i - 1].open // Current close is higher than previous open
          ) {
            detectedPatterns.push({
              id: `bullish-engulfing-${i}`,
              name: "Bullish Engulfing",
              description: "Strong bullish reversal pattern",
              type: "bullish",
              locations: [i - 1, i],
            })
          }

          // Bearish engulfing
          if (
            data[i - 1].close > data[i - 1].open && // Previous candle is bullish
            data[i].close < data[i].open && // Current candle is bearish
            data[i].open > data[i - 1].close && // Current open is higher than previous close
            data[i].close < data[i - 1].open // Current close is lower than previous open
          ) {
            detectedPatterns.push({
              id: `bearish-engulfing-${i}`,
              name: "Bearish Engulfing",
              description: "Strong bearish reversal pattern",
              type: "bearish",
              locations: [i - 1, i],
            })
          }
        }
      }

      // Detect MACD crosses
      if (enabledPatterns.macd_cross && data[0].macd !== undefined && data[0].macd_signal !== undefined) {
        for (let i = 1; i < data.length; i++) {
          // Bullish MACD cross (MACD crosses above signal line)
          if (data[i - 1].macd < data[i - 1].macd_signal && data[i].macd > data[i].macd_signal) {
            detectedPatterns.push({
              id: `macd-bullish-${i}`,
              name: "MACD Bullish Cross",
              description: "MACD crossed above signal line",
              type: "bullish",
              locations: [i],
            })
          }

          // Bearish MACD cross (MACD crosses below signal line)
          if (data[i - 1].macd > data[i - 1].macd_signal && data[i].macd < data[i].macd_signal) {
            detectedPatterns.push({
              id: `macd-bearish-${i}`,
              name: "MACD Bearish Cross",
              description: "MACD crossed below signal line",
              type: "bearish",
              locations: [i],
            })
          }
        }
      }

      // Detect Golden Cross / Death Cross
      if (
        (enabledPatterns.golden_cross || enabledPatterns.death_cross) &&
        data[0].sma_50 !== undefined &&
        data[0].sma_200 !== undefined
      ) {
        for (let i = 1; i < data.length; i++) {
          // Golden Cross (50 SMA crosses above 200 SMA)
          if (
            enabledPatterns.golden_cross &&
            data[i - 1].sma_50 < data[i - 1].sma_200 &&
            data[i].sma_50 > data[i].sma_200
          ) {
            detectedPatterns.push({
              id: `golden-cross-${i}`,
              name: "Golden Cross",
              description: "50-day SMA crossed above 200-day SMA",
              type: "bullish",
              locations: [i],
            })
          }

          // Death Cross (50 SMA crosses below 200 SMA)
          if (
            enabledPatterns.death_cross &&
            data[i - 1].sma_50 > data[i - 1].sma_200 &&
            data[i].sma_50 < data[i].sma_200
          ) {
            detectedPatterns.push({
              id: `death-cross-${i}`,
              name: "Death Cross",
              description: "50-day SMA crossed below 200-day SMA",
              type: "bearish",
              locations: [i],
            })
          }
        }
      }

      // Detect RSI Overbought/Oversold
      if ((enabledPatterns.overbought || enabledPatterns.oversold) && data[0].rsi !== undefined) {
        for (let i = 0; i < data.length; i++) {
          // RSI Overbought
          if (enabledPatterns.overbought && data[i].rsi > 70) {
            detectedPatterns.push({
              id: `rsi-overbought-${i}`,
              name: "RSI Overbought",
              description: "RSI above 70, potential reversal or correction",
              type: "bearish",
              locations: [i],
            })
          }

          // RSI Oversold
          if (enabledPatterns.oversold && data[i].rsi < 30) {
            detectedPatterns.push({
              id: `rsi-oversold-${i}`,
              name: "RSI Oversold",
              description: "RSI below 30, potential reversal or bounce",
              type: "bullish",
              locations: [i],
            })
          }
        }
      }
    }

    setPatterns(detectedPatterns)
  }, [data, enabledPatterns])

  const togglePattern = (patternId: string) => {
    setEnabledPatterns((prev) => ({
      ...prev,
      [patternId]: !prev[patternId],
    }))
  }

  const patternTypes = [
    { id: "doji", name: "Doji Candles", description: "Indecision in the market" },
    { id: "hammer", name: "Hammer", description: "Potential bullish reversal" },
    { id: "engulfing", name: "Engulfing Patterns", description: "Strong reversal signals" },
    { id: "macd_cross", name: "MACD Crosses", description: "Momentum shifts" },
    { id: "golden_cross", name: "Golden Cross", description: "Long-term bullish signal" },
    { id: "death_cross", name: "Death Cross", description: "Long-term bearish signal" },
    { id: "overbought", name: "RSI Overbought", description: "RSI above 70" },
    { id: "oversold", name: "RSI Oversold", description: "RSI below 30" },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Pattern Detection
        </CardTitle>
        <CardDescription>Automatically detect technical patterns in your data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {patternTypes.map((pattern) => (
              <div key={pattern.id} className="flex items-center justify-between space-x-2 p-2 border rounded-md">
                <div>
                  <Label htmlFor={`pattern-${pattern.id}`} className="font-medium text-sm">
                    {pattern.name}
                  </Label>
                  <p className="text-xs text-muted-foreground">{pattern.description}</p>
                </div>
                <Switch
                  id={`pattern-${pattern.id}`}
                  checked={enabledPatterns[pattern.id]}
                  onCheckedChange={() => togglePattern(pattern.id)}
                />
              </div>
            ))}
          </div>

          <div className="border rounded-md p-3">
            <h4 className="text-sm font-medium mb-2">Detected Patterns ({patterns.length})</h4>
            {patterns.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {patterns.map((pattern) => (
                    <div key={pattern.id} className="flex items-start space-x-2 p-2 border rounded-md">
                      {pattern.type === "bullish" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : pattern.type === "bearish" ? (
                        <TrendingDown className="h-4 w-4 text-red-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{pattern.name}</span>
                          <Badge
                            variant={
                              pattern.type === "bullish"
                                ? "success"
                                : pattern.type === "bearish"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {pattern.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{pattern.description}</p>
                        <p className="text-xs mt-1">
                          Position: {pattern.locations.map((loc) => data[loc]?.datetime?.substring(0, 10)).join(", ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-[100px] text-sm text-muted-foreground">
                No patterns detected in the current data
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
