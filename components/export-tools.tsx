"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, ImageIcon, FileJson, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ExportToolsProps {
  data: any[]
  chartRef: React.RefObject<HTMLDivElement>
}

export default function ExportTools({ data, chartRef }: ExportToolsProps) {
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "csv" | "json">("png")
  const [imageQuality, setImageQuality] = useState<"high" | "medium" | "low">("high")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  // Get all available columns from data
  const allColumns = data.length > 0 ? Object.keys(data[0]).filter((col) => col !== "datetime") : []

  const handleExport = async () => {
    try {
      if (exportFormat === "png" || exportFormat === "jpeg") {
        await exportChart(exportFormat)
      } else if (exportFormat === "csv") {
        exportData("csv")
      } else if (exportFormat === "json") {
        exportData("json")
      }

      setIsDialogOpen(false)

      toast({
        title: "Export successful",
        description: `Your data has been exported as ${exportFormat.toUpperCase()}.`,
      })
    } catch (error) {
      console.error("Export failed:", error)

      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const exportChart = async (format: "png" | "jpeg") => {
    if (!chartRef.current) return

    try {
      // Use html2canvas to capture the chart (would be imported in a real implementation)
      // For this demo, we'll simulate the export
      console.log(`Exporting chart as ${format}...`)

      // In a real implementation, this would use html2canvas:
      // const canvas = await html2canvas(chartRef.current)
      // const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : undefined)

      // Simulate download
      const link = document.createElement("a")
      link.download = `financial-chart.${format}`
      // link.href = dataUrl
      link.href = "#" // Placeholder
      link.click()
    } catch (error) {
      console.error("Error exporting chart:", error)
      throw error
    }
  }

  const exportData = (format: "csv" | "json") => {
    if (data.length === 0) return

    try {
      let content: string
      let mimeType: string
      let filename: string

      // Filter data to only include selected columns (or all if none selected)
      const columnsToExport = selectedColumns.length > 0 ? selectedColumns : allColumns
      const filteredData = data.map((row) => {
        const newRow: Record<string, any> = { datetime: row.datetime }
        columnsToExport.forEach((col) => {
          newRow[col] = row[col]
        })
        return newRow
      })

      if (format === "csv") {
        // Create CSV content
        const headers = ["datetime", ...columnsToExport]
        const csvRows = [
          headers.join(","),
          ...filteredData.map((row) =>
            headers
              .map((header) => {
                const value = row[header]
                // Handle values that might contain commas
                return typeof value === "string" && value.includes(",") ? `"${value}"` : value
              })
              .join(","),
          ),
        ]
        content = csvRows.join("\n")
        mimeType = "text/csv"
        filename = "financial-data.csv"
      } else {
        // Create JSON content
        content = JSON.stringify(filteredData, null, 2)
        mimeType = "application/json"
        filename = "financial-data.json"
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting data:", error)
      throw error
    }
  }

  const handleColumnToggle = (column: string) => {
    setSelectedColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]))
  }

  const handleSelectAllColumns = () => {
    setSelectedColumns(allColumns)
  }

  const handleDeselectAllColumns = () => {
    setSelectedColumns([])
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Data</DialogTitle>
          <DialogDescription>Export your financial data and charts in various formats.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="chart" className="mt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="flex gap-2">
                <Button
                  variant={exportFormat === "png" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("png")}
                  className="flex-1"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  PNG
                </Button>
                <Button
                  variant={exportFormat === "jpeg" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("jpeg")}
                  className="flex-1"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  JPEG
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image Quality</Label>
              <Select
                value={imageQuality}
                onValueChange={(value) => setImageQuality(value as "high" | "medium" | "low")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="flex gap-2">
                <Button
                  variant={exportFormat === "csv" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("csv")}
                  className="flex-1"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant={exportFormat === "json" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setExportFormat("json")}
                  className="flex-1"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Select Columns</Label>
                <div className="space-x-2">
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={handleSelectAllColumns}>
                    Select All
                  </Button>
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={handleDeselectAllColumns}>
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-2">
                {allColumns.map((column) => (
                  <div key={column} className="flex items-center space-x-2">
                    <Checkbox
                      id={`column-${column}`}
                      checked={selectedColumns.includes(column)}
                      onCheckedChange={() => handleColumnToggle(column)}
                    />
                    <Label htmlFor={`column-${column}`} className="text-sm">
                      {column}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
