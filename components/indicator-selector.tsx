"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import type { IndicatorGroup } from "@/lib/types"

interface IndicatorSelectorProps {
  groups: IndicatorGroup[]
  selectedIndicators: string[]
  onToggle: (indicator: string) => void
}

export default function IndicatorSelector({ groups, selectedIndicators, onToggle }: IndicatorSelectorProps) {
  const [openGroups, setOpenGroups] = useState<string[]>(["Price", "Moving Averages"])

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => (prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]))
  }

  // Get indicator display name
  const getDisplayName = (indicator: string) => {
    const nameMap: Record<string, string> = {
      close: "Close",
      open: "Open",
      high: "High",
      low: "Low",
      volume: "Volume",
      sma_5: "SMA (5)",
      sma_10: "SMA (10)",
      sma_20: "SMA (20)",
      sma_50: "SMA (50)",
      sma_200: "SMA (200)",
      ema_5: "EMA (5)",
      ema_10: "EMA (10)",
      ema_20: "EMA (20)",
      ema_50: "EMA (50)",
      ema_200: "EMA (200)",
      ema_12: "EMA (12)",
      ema_26: "EMA (26)",
      macd: "MACD",
      macd_signal: "MACD Signal",
      macd_hist: "MACD Histogram",
      rsi: "RSI",
      bollinger_upper: "Bollinger Upper",
      bollinger_mid: "Bollinger Middle",
      bollinger_lower: "Bollinger Lower",
      bollinger_std: "Bollinger Std Dev",
      tr: "True Range",
      atr: "ATR",
      momentum: "Momentum",
      roc: "Rate of Change",
      volume_sma: "Volume SMA",
      price_to_sma_20: "Price/SMA20",
      price_to_sma_50: "Price/SMA50",
      sma_20_50_cross: "SMA20/50 Cross",
      volatility: "Volatility",
      dist_from_high_20: "Dist from High",
      dist_from_low_20: "Dist from Low",
    }

    return nameMap[indicator] || indicator
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Technical Indicators</h3>
        <Badge variant="outline">{selectedIndicators.length} selected</Badge>
      </div>

      {groups.map((group) => (
        <Collapsible
          key={group.name}
          open={openGroups.includes(group.name)}
          onOpenChange={() => toggleGroup(group.name)}
          className="border rounded-md"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-4 h-auto">
              <span>{group.name}</span>
              <ChevronRight
                className={`h-4 w-4 transition-transform ${openGroups.includes(group.name) ? "rotate-90" : ""}`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 pt-1 space-y-2">
            {group.indicators.map((indicator) => (
              <div key={indicator} className="flex items-center justify-between">
                <Label htmlFor={`indicator-${indicator}`} className="flex-1 cursor-pointer">
                  {getDisplayName(indicator)}
                </Label>
                <Switch
                  id={`indicator-${indicator}`}
                  checked={selectedIndicators.includes(indicator)}
                  onCheckedChange={() => onToggle(indicator)}
                />
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
