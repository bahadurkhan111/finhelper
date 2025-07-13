"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Preset {
  id: string
  name: string
  indicators: string[]
}

interface IndicatorPresetsProps {
  selectedIndicators: string[]
  onSelectPreset: (indicators: string[]) => void
  allIndicators: string[]
}

export default function IndicatorPresets({ selectedIndicators, onSelectPreset, allIndicators }: IndicatorPresetsProps) {
  const [presets, setPresets] = useState<Preset[]>([
    {
      id: "default",
      name: "Default View",
      indicators: ["close", "sma_20", "sma_50", "bollinger_upper", "bollinger_lower"],
    },
    {
      id: "trend-following",
      name: "Trend Following",
      indicators: ["close", "sma_20", "sma_50", "sma_200", "ema_20", "ema_50"],
    },
    {
      id: "momentum",
      name: "Momentum",
      indicators: ["close", "rsi", "macd", "macd_signal", "macd_hist"],
    },
    {
      id: "volatility",
      name: "Volatility",
      indicators: ["close", "bollinger_upper", "bollinger_mid", "bollinger_lower", "atr", "volatility"],
    },
  ])
  const [newPresetName, setNewPresetName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a preset name",
        variant: "destructive",
      })
      return
    }

    const newPreset: Preset = {
      id: `preset-${Date.now()}`,
      name: newPresetName,
      indicators: selectedIndicators,
    }

    setPresets([...presets, newPreset])
    setNewPresetName("")
    setIsDialogOpen(false)

    toast({
      title: "Preset saved",
      description: `"${newPresetName}" has been saved successfully.`,
    })
  }

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter((preset) => preset.id !== id))

    toast({
      title: "Preset deleted",
      description: "The preset has been deleted.",
    })
  }

  const handleSelectPreset = (preset: Preset) => {
    onSelectPreset(preset.indicators)

    toast({
      title: "Preset applied",
      description: `"${preset.name}" has been applied.`,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Indicator Presets</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Save Current
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Indicator Preset</DialogTitle>
              <DialogDescription>
                Save your current indicator selection as a preset for quick access later.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="preset-name">Preset Name</Label>
              <Input
                id="preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="My Custom Preset"
                className="mt-2"
              />
              <div className="mt-4">
                <Label>Selected Indicators ({selectedIndicators.length})</Label>
                <ScrollArea className="h-24 mt-2 rounded border p-2">
                  <div className="space-y-1">
                    {selectedIndicators.map((indicator) => (
                      <div key={indicator} className="text-sm">
                        {indicator}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePreset}>
                <Save className="h-4 w-4 mr-2" />
                Save Preset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {presets.map((preset) => (
          <Card key={preset.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium">{preset.name}</CardTitle>
                {preset.id !== "default" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeletePreset(preset.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <CardDescription className="text-xs">{preset.indicators.length} indicators</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-1 mb-3">
                {preset.indicators.slice(0, 5).map((indicator) => (
                  <div key={indicator} className="text-xs px-2 py-1 bg-muted rounded-sm">
                    {indicator}
                  </div>
                ))}
                {preset.indicators.length > 5 && (
                  <div className="text-xs px-2 py-1 bg-muted rounded-sm">+{preset.indicators.length - 5} more</div>
                )}
              </div>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => handleSelectPreset(preset)}>
                Apply
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
