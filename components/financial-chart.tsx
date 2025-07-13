"use client"

import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line } from "react-chartjs-2"
import "chartjs-adapter-date-fns"
import { createGradient } from "@/lib/chart-utils"

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, TimeScale, Tooltip, Legend, Filler)

// Define color palette for indicators
const COLORS = {
  close: "#2563eb",
  open: "#64748b",
  high: "#10b981",
  low: "#ef4444",
  volume: "#6366f1",
  sma_5: "#8b5cf6",
  sma_10: "#ec4899",
  sma_20: "#f59e0b",
  sma_50: "#06b6d4",
  sma_200: "#84cc16",
  ema_5: "#8b5cf6",
  ema_10: "#ec4899",
  ema_20: "#f59e0b",
  ema_50: "#06b6d4",
  ema_200: "#84cc16",
  bollinger_upper: "#94a3b8",
  bollinger_lower: "#94a3b8",
  bollinger_mid: "#64748b",
  macd: "#2563eb",
  macd_signal: "#ef4444",
  macd_hist: "#10b981",
  rsi: "#8b5cf6",
}

interface FinancialChartProps {
  data: any[]
  selectedIndicators: string[]
  chartType: "line" | "candlestick" | "bar"
  timeRange: [number, number]
}

export default function FinancialChart({ data, selectedIndicators, chartType, timeRange }: FinancialChartProps) {
  const chartRef = useRef<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (data.length === 0) return

    setLoading(true)

    // Filter data based on time range
    const start = Math.floor(data.length * (timeRange[0] / 100))
    const end = Math.ceil(data.length * (timeRange[1] / 100))
    const filteredData = data.slice(start, end)

    // Prepare chart data
    const labels = filteredData.map((item) => {
      if (typeof item.datetime === "string") {
        return new Date(item.datetime)
      }
      return item.datetime
    })

    const datasets = selectedIndicators.map((indicator) => {
      const color = COLORS[indicator as keyof typeof COLORS] || "#000000"

      return {
        label: indicator,
        data: filteredData.map((item) => item[indicator]),
        borderColor: color,
        backgroundColor:
          indicator === "volume" ? createGradient(chartRef.current?.ctx, chartRef.current?.chartArea, color) : color,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        tension: 0.1,
        fill: indicator.includes("bollinger_")
          ? indicator === "bollinger_upper"
            ? "+1"
            : indicator === "bollinger_lower"
              ? false
              : false
          : false,
        yAxisID: indicator === "volume" ? "y1" : "y",
        type: indicator === "volume" ? "bar" : "line",
        order: indicator === "volume" ? 1 : 0,
      }
    })

    // Special case for Bollinger Bands - add fill between upper and lower
    if (selectedIndicators.includes("bollinger_upper") && selectedIndicators.includes("bollinger_lower")) {
      const upperIndex = selectedIndicators.indexOf("bollinger_upper")
      const lowerIndex = selectedIndicators.indexOf("bollinger_lower")

      if (upperIndex !== -1 && lowerIndex !== -1) {
        datasets[upperIndex].fill = "+1"
        datasets[upperIndex].backgroundColor = "rgba(148, 163, 184, 0.2)"
      }
    }

    setChartData({
      labels,
      datasets,
    })

    setLoading(false)
  }, [data, selectedIndicators, timeRange, chartType])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "day" as const,
          tooltipFormat: "PPP",
          displayFormats: {
            day: "MMM d",
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || ""
            const value = context.parsed.y
            return `${label}: ${value.toFixed(2)}`
          },
        },
      },
    },
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="space-y-2 w-full max-w-md">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-4">
      <div className="h-full" ref={chartRef}>
        {chartData && <Line options={options} data={chartData} height={null} width={null} />}
      </div>
    </div>
  )
}
