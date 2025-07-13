# FinHelper: Financial Indicators Dashboard

FinHelper is a modern web application for visualizing and analyzing financial market data with advanced technical indicators. Built using Next.js, React, and Tailwind CSS, it provides an interactive dashboard for uploading, exploring, and exporting financial data, making it ideal for traders, analysts, and finance enthusiasts.

## Features

- **Upload CSV Data**: Import your own OHLCV (Open, High, Low, Close, Volume) data for analysis.
- **Technical Indicators**: Supports a wide range of technical indicators including SMA, EMA, MACD, RSI, Bollinger Bands, ATR, and more.
- **Interactive Charts**: Switch between candlestick, line, and bar chart types. Zoom and filter by time range.
- **Multi-Chart View**: Compare multiple indicators or assets side by side.
- **Pattern Detection**: Analyze data for common trading patterns.
- **Export Tools**: Download processed data and chart images for reporting and further analysis.
- **Customizable Display**: Toggle volume, grid, tooltips, and other chart options.
- **Responsive UI**: Optimized for both desktop and mobile devices.
- **Dark Mode**: Seamless light/dark theme switching.

## Demo

![Dashboard Screenshot](public/placeholder.jpg)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- pnpm, npm, or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/finhelper.git
   cd finhelper
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```
3. **Run the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Usage

- **Upload Data**: Click on the "Upload" button in the sidebar to import your CSV file. The file should include columns: `open`, `high`, `low`, `close`, `volume`, and optionally `datetime`.
- **Select Indicators**: Use the sidebar to choose which indicators to display on the chart.
- **Change Chart Type**: Switch between candlestick, line, or bar charts in the display settings.
- **Export**: Use the export tools to download your chart or processed data.

## Project Structure

```
finhelper/
├── app/                  # Main Next.js app (pages, layout, entry)
├── components/           # React UI components (charts, selectors, uploaders, etc.)
├── lib/                  # Data processing, indicator calculation, and utilities
├── hooks/                # Custom React hooks
├── public/               # Static assets (images, logos)
├── styles/               # Global styles (Tailwind CSS)
├── financial_visualization.py # Python script for advanced visualization/analysis
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
```

## Dependencies

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide React](https://lucide.dev/)
- [date-fns](https://date-fns.org/)
- [zod](https://zod.dev/)

## Python Utilities

The `financial_visualization.py` script provides additional data generation and indicator calculation utilities using Python (NumPy, pandas, matplotlib). You can use it for advanced analysis or generating sample data.

## Contributing

Contributions are welcome! Please open issues or submit pull requests for new features, bug fixes, or improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Inspired by popular trading platforms and open-source charting libraries.
- Built with open-source technologies by the FinHelper team.

---

For questions or support, feel free to open an issue on GitHub.
