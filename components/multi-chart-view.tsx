"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  X,
  ArrowRightIcon as ArrowsMaximize,
  ArrowLeftIcon as ArrowsMinimize,
  LineChart,
  CandlestickChart,
  BarChart3,
} from "lucide-react"
import FinancialChart from "@/components/financial-chart"
import { useToast } from "@/hooks/use-toast"

interface MultiChartViewProps {
  data: any[]
  allIndicators: string[]
}

interface ChartConfig {
  id: string
  selectedIndicators: string[]
  chartType: "line" | "candlestick" | "bar"
  timeRange: [number, number]
  title: string
}

export default function MultiChartView({ data, allIndicators }: MultiChartViewProps) {
  const [charts, setCharts] = useState<ChartConfig[]>([
    {
      id: "chart-1",
      selectedIndicators: ["close", "sma_20", "sma_50"],
      chartType: "line",
      timeRange: [0, 100],
      title: "Price & Moving Averages",
    },
    {
      id: "chart-2",
      selectedIndicators: ["rsi"],
      chartType: "line",
      timeRange: [0, 100],
      title: "RSI",
    },
  ])
  const [layout, setLayout] = useState<"grid" | "single">("grid")
  const [activeChart, setActiveChart] = useState<string>("chart-1")
  const { toast } = useToast()

  const handleAddChart = () => {
    if (charts.length >= 4) {
      toast({
        title: "Maximum charts reached",
        description: "You can have a maximum of 4 charts at once.",
        variant: "destructive",
      })
      return
    }

    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      selectedIndicators: ["close"],
      chartType: "line",
      timeRange: [0, 100],
      title: `Chart ${charts.length + 1}`,
    }

    setCharts([...charts, newChart])
    setActiveChart(newChart.id)
  }

  const handleRemoveChart = (id: string) => {
    if (charts.length <= 1) {
      toast({
        title: "Cannot remove chart",
        description: "You must have at least one chart.",
        variant: "destructive",
      })
      return
    }

    const newCharts = charts.filter((chart) => chart.id !== id)
    setCharts(newCharts)

    if (activeChart === id) {
      setActiveChart(newCharts[0].id)
    }
  }

  const handleUpdateChart = (id: string, updates: Partial<ChartConfig>) => {
    setCharts(charts.map((chart) => (chart.id === id ? { ...chart, ...updates } : chart)))
  }

  const handleToggleLayout = () => {
    setLayout(layout === "grid" ? "single" : "grid")
  }

  const getChartGridClass = () => {
    if (layout === "single") return "grid-cols-1"

    switch (charts.length) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-1 md:grid-cols-2"
      case 3:
      case 4:
        return "grid-cols-1 md:grid-cols-2"
      default:
        return "grid-cols-1"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Multi-Chart View</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleLayout}>
            {layout === "grid" ? (
              <>
                <ArrowsMaximize className="h-4 w-4 mr-2" />
                Single View
              </>
            ) : (
              <>
                <ArrowsMinimize className="h-4 w-4 mr-2" />
                Grid View
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddChart}>
            <Plus className="h-4 w-4 mr-2" />
            Add Chart
          </Button>
        </div>
      </div>

      {layout === "single" && (
        <Tabs value={activeChart} onValueChange={setActiveChart} className="w-full">
          <TabsList className="w-full justify-start mb-4 overflow-x-auto">
            {charts.map((chart) => (
              <TabsTrigger key={chart.id} value={chart.id} className="relative">
                {chart.title}
                {charts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 absolute -right-2 -top-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveChart(chart.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {charts.map((chart) => (
            <TabsContent key={chart.id} value={chart.id} className="m-0">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chart.title}
                      onChange={(e) => handleUpdateChart(chart.id, { title: e.target.value })}
                      className="bg-transparent border-none text-lg font-medium focus:outline-none focus:ring-0 p-0"
                    />
                    <Select
                      value={chart.chartType}
                      onValueChange={(value) =>
                        handleUpdateChart(chart.id, { chartType: value as "line" | "candlestick" | "bar" })
                      }
                    >
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">
                          <div className="flex items-center">
                            <LineChart className="h-4 w-4 mr-2" />
                            Line
                          </div>
                        </SelectItem>
                        <SelectItem value="candlestick">
                          <div className="flex items-center">
                            <CandlestickChart className="h-4 w-4 mr-2" />
                            Candlestick
                          </div>
                        </SelectItem>
                        <SelectItem value="bar">
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Bar
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select
                    value={chart.selectedIndicators[0]}
                    onValueChange={(value) =>
                      handleUpdateChart(chart.id, { selectedIndicators: [value, ...chart.selectedIndicators.slice(1)] })
                    }
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="Select indicator" />
                    </SelectTrigger>
                    <SelectContent>
                      {allIndicators.map((indicator) => (
                        <SelectItem key={indicator} value={indicator}>
                          {indicator}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[400px]">
                  <FinancialChart
                    data={data}
                    selectedIndicators={chart.selectedIndicators}
                    chartType={chart.chartType}
                    timeRange={chart.timeRange}
                  />
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {layout === "grid" && (
        <div className={`grid ${getChartGridClass()} gap-4`}>
          {charts.map((chart) => (
            <Card key={chart.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chart.title}
                    onChange={(e) => handleUpdateChart(chart.id, { title: e.target.value })}
                    className="bg-transparent border-none text-sm font-medium focus:outline-none focus:ring-0 p-0"
                  />
                  <div className="flex gap-1">
                    <Button
                      variant={chart.chartType === "line" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleUpdateChart(chart.id, { chartType: "line" })}
                    >
                      <LineChart className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={chart.chartType === "candlestick" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleUpdateChart(chart.id, { chartType: "candlestick" })}
                    >
                      <CandlestickChart className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={chart.chartType === "bar" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleUpdateChart(chart.id, { chartType: "bar" })}
                    >
                      <BarChart3 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Select
                    value={chart.selectedIndicators[0]}
                    onValueChange={(value) =>
                      handleUpdateChart(chart.id, { selectedIndicators: [value, ...chart.selectedIndicators.slice(1)] })
                    }
                  >
                    <SelectTrigger className="w-[120px] h-7 text-xs">
                      <SelectValue placeholder="Select indicator" />
                    </SelectTrigger>
                    <SelectContent>
                      {allIndicators.map((indicator) => (
                        <SelectItem key={indicator} value={indicator}>
                          {indicator}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {charts.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveChart(chart.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="h-[250px]">
                <FinancialChart
                  data={data}
                  selectedIndicators={chart.selectedIndicators}
                  chartType={chart.chartType}
                  timeRange={chart.timeRange}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
