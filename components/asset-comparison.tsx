"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LineChart, Plus, X, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react"
import { calculateIndicators } from "@/lib/indicators"
import { parseCsvData } from "@/lib/data-utils"
import { useToast } from "@/hooks/use-toast"

interface AssetComparisonProps {
  primaryData: any[]
}

interface ComparisonAsset {
  id: string
  name: string
  data: any[]
  color: string
  visible: boolean
}

export default function AssetComparison({ primaryData }: AssetComparisonProps) {
  const [comparisonAssets, setComparisonAssets] = useState<ComparisonAsset[]>([])
  const [newAssetName, setNewAssetName] = useState("")
  const [comparisonType, setComparisonType] = useState<"price" | "percent" | "correlation">("percent")
  const { toast } = useToast()

  // Color palette for comparison assets
  const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#84cc16", "#ef4444", "#6366f1"]

  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text()
      const parsedData = parseCsvData(text)

      if (parsedData.length === 0) {
        toast({
          title: "Invalid data",
          description: "The uploaded file doesn't contain valid data.",
          variant: "destructive",
        })
        return
      }

      // Calculate indicators for the new asset
      const dataWithIndicators = calculateIndicators(parsedData)

      // Generate a name if not provided
      const name = newAssetName.trim() || `Asset ${comparisonAssets.length + 1}`

      // Add the new asset to the comparison list
      const newAsset: ComparisonAsset = {
        id: `asset-${Date.now()}`,
        name,
        data: dataWithIndicators,
        color: colors[comparisonAssets.length % colors.length],
        visible: true,
      }

      setComparisonAssets([...comparisonAssets, newAsset])
      setNewAssetName("")

      toast({
        title: "Asset added",
        description: `"${name}" has been added for comparison.`,
      })
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Error",
        description: "Failed to process the uploaded file.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAsset = (id: string) => {
    setComparisonAssets(comparisonAssets.filter((asset) => asset.id !== id))
  }

  const toggleAssetVisibility = (id: string) => {
    setComparisonAssets(
      comparisonAssets.map((asset) => (asset.id === id ? { ...asset, visible: !asset.visible } : asset)),
    )
  }

  // Calculate performance metrics
  const calculatePerformance = (data: any[]) => {
    if (!data || data.length < 2) return { change: 0, percentChange: 0 }

    const firstPrice = data[0].close
    const lastPrice = data[data.length - 1].close
    const change = lastPrice - firstPrice
    const percentChange = (change / firstPrice) * 100

    return { change, percentChange }
  }

  const primaryPerformance = calculatePerformance(primaryData)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Asset Comparison
        </CardTitle>
        <CardDescription>Compare multiple assets against your primary data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Asset name (optional)"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0])
                }
              }}
              className="flex-1"
            />
            <Select
              value={comparisonType}
              onValueChange={(value) => setComparisonType(value as "price" | "percent" | "correlation")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Comparison type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Absolute Price</SelectItem>
                <SelectItem value="percent">Percent Change</SelectItem>
                <SelectItem value="correlation">Correlation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Assets</h4>
              <Badge variant="outline">{comparisonAssets.filter((a) => a.visible).length + 1} visible</Badge>
            </div>

            <div className="space-y-2">
              {/* Primary asset */}
              <div className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="font-medium text-sm">Primary Asset</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {primaryPerformance.percentChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm ${primaryPerformance.percentChange >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {primaryPerformance.percentChange.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparison assets */}
              {comparisonAssets.map((asset) => {
                const performance = calculatePerformance(asset.data)

                return (
                  <div key={asset.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }}></div>
                      <span className="font-medium text-sm">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {performance.percentChange >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`text-sm ${performance.percentChange >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {performance.percentChange.toFixed(2)}%
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleAssetVisibility(asset.id)}
                      >
                        <LineChart className={`h-4 w-4 ${asset.visible ? "opacity-100" : "opacity-40"}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemoveAsset(asset.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}

              {comparisonAssets.length === 0 && (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <Plus className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">Upload CSV files to add comparison assets</p>
                </div>
              )}
            </div>
          </div>

          {comparisonAssets.length > 0 && (
            <div className="h-[300px] border rounded-md p-3">
              <div className="text-center text-sm text-muted-foreground p-4">
                Chart visualization would be rendered here, showing{" "}
                {comparisonType === "price"
                  ? "absolute prices"
                  : comparisonType === "percent"
                    ? "percent changes"
                    : "correlation"}{" "}
                between assets
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
