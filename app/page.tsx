"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { BarChart3, LineChart, CandlestickChart, Settings, Layers } from "lucide-react"
import FinancialChart from "@/components/financial-chart"
import IndicatorSelector from "@/components/indicator-selector"
import IndicatorPresets from "@/components/indicator-presets"
import FileUploader from "@/components/file-uploader"
import MultiChartView from "@/components/multi-chart-view"
import ExportTools from "@/components/export-tools"
import PatternDetection from "@/components/pattern-detection"
import AssetComparison from "@/components/asset-comparison"
import { calculateIndicators } from "@/lib/indicators"
import { parseCsvData } from "@/lib/data-utils"
import type { IndicatorGroup } from "@/lib/types"

export default function Home() {
  const [data, setData] = useState<any[]>([])
  const [processedData, setProcessedData] = useState<any[]>([])
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([
    "close",
    "sma_20",
    "sma_50",
    "bollinger_upper",
    "bollinger_lower",
  ])
  const [chartType, setChartType] = useState<"line" | "candlestick" | "bar">("candlestick")
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 100])
  const [showSidebar, setShowSidebar] = useState(true)
  const [activeTab, setActiveTab] = useState("chart")
  const [sidebarTab, setSidebarTab] = useState("indicators")
  const chartRef = useRef<HTMLDivElement>(null)

  // Indicator groups for the selector
  const indicatorGroups: IndicatorGroup[] = [
    {
      name: "Price",
      indicators: ["open", "high", "low", "close", "volume"],
    },
    {
      name: "Moving Averages",
      indicators: ["sma_5", "sma_10", "sma_20", "sma_50", "sma_200", "ema_5", "ema_10", "ema_20", "ema_50", "ema_200"],
    },
    {
      name: "Oscillators",
      indicators: ["macd", "macd_signal", "macd_hist", "rsi"],
    },
    {
      name: "Volatility",
      indicators: ["bollinger_upper", "bollinger_mid", "bollinger_lower", "bollinger_std", "tr", "atr", "volatility"],
    },
    {
      name: "Momentum",
      indicators: ["momentum", "roc"],
    },
    {
      name: "Relative Metrics",
      indicators: ["price_to_sma_20", "price_to_sma_50", "sma_20_50_cross", "dist_from_high_20", "dist_from_low_20"],
    },
  ]

  // Get all indicators
  const allIndicators = indicatorGroups.flatMap((group) => group.indicators)

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      const text = await file.text()
      const parsedData = parseCsvData(text)
      setData(parsedData)

      // Calculate indicators
      const dataWithIndicators = calculateIndicators(parsedData)
      setProcessedData(dataWithIndicators)
    } catch (error) {
      console.error("Error processing file:", error)
    }
  }

  // Handle indicator selection
  const handleIndicatorToggle = (indicator: string) => {
    setSelectedIndicators((prev) =>
      prev.includes(indicator) ? prev.filter((i) => i !== indicator) : [...prev, indicator],
    )
  }

  // Handle preset selection
  const handleSelectPreset = (indicators: string[]) => {
    setSelectedIndicators(indicators)
  }

  // Handle time range change
  const handleTimeRangeChange = (value: number[]) => {
    setTimeRange([value[0], value[1]])
  }

  // Filter data based on time range
  useEffect(() => {
    if (processedData.length > 0) {
      const start = Math.floor(processedData.length * (timeRange[0] / 100))
      const end = Math.ceil(processedData.length * (timeRange[1] / 100))
      // We don't actually filter the data here, we just pass the range to the chart component
    }
  }, [timeRange, processedData])

  return (
    <main className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <header className="border-b bg-white dark:bg-gray-950 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CandlestickChart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Financial Indicators Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          {processedData.length > 0 && <ExportTools data={processedData} chartRef={chartRef} />}
          <Button variant="outline" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
            <Settings className="h-4 w-4 mr-2" />
            {showSidebar ? "Hide Settings" : "Show Settings"}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-80 border-r bg-white dark:bg-gray-950 flex flex-col">
            <Tabs value={sidebarTab} onValueChange={setSidebarTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-4 mx-4 mt-4">
                <TabsTrigger value="indicators">Indicators</TabsTrigger>
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="appearance">Display</TabsTrigger>
                <TabsTrigger value="data">Data</TabsTrigger>
              </TabsList>

              <TabsContent value="indicators" className="flex-1 p-4 pt-2">
                <ScrollArea className="h-[calc(100vh-180px)]">
                  <IndicatorSelector
                    groups={indicatorGroups}
                    selectedIndicators={selectedIndicators}
                    onToggle={handleIndicatorToggle}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="presets" className="flex-1 p-4 pt-2">
                <ScrollArea className="h-[calc(100vh-180px)]">
                  <IndicatorPresets
                    selectedIndicators={selectedIndicators}
                    onSelectPreset={handleSelectPreset}
                    allIndicators={allIndicators}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="appearance" className="flex-1 p-4 pt-2">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Chart Type</h3>
                    <div className="flex gap-2">
                      <Button
                        variant={chartType === "line" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartType("line")}
                      >
                        <LineChart className="h-4 w-4 mr-2" />
                        Line
                      </Button>
                      <Button
                        variant={chartType === "candlestick" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartType("candlestick")}
                      >
                        <CandlestickChart className="h-4 w-4 mr-2" />
                        Candlestick
                      </Button>
                      <Button
                        variant={chartType === "bar" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartType("bar")}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Bar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">Time Range</h3>
                      <span className="text-xs text-muted-foreground">
                        {timeRange[0]}% - {timeRange[1]}%
                      </span>
                    </div>
                    <Slider
                      defaultValue={[0, 100]}
                      max={100}
                      step={1}
                      value={[timeRange[0], timeRange[1]]}
                      onValueChange={handleTimeRangeChange}
                      className="my-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Display Options</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-volume">Show Volume</Label>
                        <Switch id="show-volume" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-grid">Show Grid</Label>
                        <Switch id="show-grid" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="show-tooltips">Show Tooltips</Label>
                        <Switch id="show-tooltips" defaultChecked />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="data" className="flex-1 p-4 pt-2">
                <div className="space-y-6">
                  <FileUploader onFileUpload={handleFileUpload} />

                  {data.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Data Summary</h3>
                      <div className="text-sm">
                        <p>Total records: {data.length}</p>
                        <p>
                          Date range: {data[0]?.datetime?.substring(0, 10)} to{" "}
                          {data[data.length - 1]?.datetime?.substring(0, 10)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 py-3 border-b bg-white dark:bg-gray-950">
              <TabsList>
                <TabsTrigger value="chart">Single Chart</TabsTrigger>
                <TabsTrigger value="multi">Multi Chart</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="data">Data Table</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chart" className="flex-1 p-6">
              {processedData.length > 0 ? (
                <Card className="h-full">
                  <div ref={chartRef} className="h-full">
                    <FinancialChart
                      data={processedData}
                      selectedIndicators={selectedIndicators}
                      chartType={chartType}
                      timeRange={timeRange}
                    />
                  </div>
                </Card>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <CandlestickChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Upload a CSV file with OHLCV data to get started. The file should include open, high, low, close,
                    and volume columns.
                  </p>
                  <FileUploader onFileUpload={handleFileUpload} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="multi" className="flex-1 p-6">
              {processedData.length > 0 ? (
                <MultiChartView data={processedData} allIndicators={allIndicators} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Layers className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">Upload a CSV file to use the multi-chart view.</p>
                  <FileUploader onFileUpload={handleFileUpload} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="flex-1 p-6">
              {processedData.length > 0 ? (
                <PatternDetection data={processedData} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <LineChart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Upload a CSV file to use the pattern detection tools.
                  </p>
                  <FileUploader onFileUpload={handleFileUpload} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="comparison" className="flex-1 p-6">
              {processedData.length > 0 ? (
                <AssetComparison primaryData={processedData} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">Upload a CSV file to compare with other assets.</p>
                  <FileUploader onFileUpload={handleFileUpload} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="data" className="flex-1 p-6">
              <Card className="h-full overflow-hidden">
                {processedData.length > 0 ? (
                  <div className="h-full overflow-auto">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-muted">
                        <tr>
                          <th className="p-2 text-left font-medium text-sm">Date</th>
                          {Object.keys(processedData[0])
                            .filter((key) => key !== "datetime")
                            .map((key) => (
                              <th key={key} className="p-2 text-left font-medium text-sm">
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {processedData.slice(0, 100).map((row, i) => (
                          <tr key={i} className="border-t hover:bg-muted/50">
                            <td className="p-2 text-sm">
                              {typeof row.datetime === "string"
                                ? row.datetime.substring(0, 19)
                                : new Date(row.datetime).toLocaleString()}
                            </td>
                            {Object.entries(row)
                              .filter(([key]) => key !== "datetime")
                              .map(([key, value]) => (
                                <td key={key} className="p-2 text-sm">
                                  {typeof value === "number" ? Number(value).toFixed(2) : String(value)}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
                    <p className="text-muted-foreground mb-6">Upload a CSV file to view the data table.</p>
                    <FileUploader onFileUpload={handleFileUpload} />
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
