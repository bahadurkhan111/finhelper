/**
 * Parse CSV data into an array of objects
 */
export function parseCsvData(csvText: string): any[] {
  // Split the CSV text into lines
  const lines = csvText.trim().split("\n")

  // Extract headers (first line)
  const headers = lines[0].split(",").map((header) => header.trim())

  // Parse data rows
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((value) => value.trim())

    // Skip empty lines
    if (values.length !== headers.length) continue

    const row: Record<string, any> = {}

    // Map values to headers
    for (let j = 0; j < headers.length; j++) {
      const value = values[j]

      // Try to convert to number if possible
      if (!isNaN(Number(value)) && value !== "") {
        row[headers[j]] = Number(value)
      } else {
        row[headers[j]] = value
      }
    }

    // Add datetime field if timestamp exists
    if (row.timestamp) {
      try {
        row.datetime = new Date(row.timestamp)
      } catch (e) {
        // If timestamp parsing fails, use it as is
        row.datetime = row.timestamp
      }
    }

    data.push(row)
  }

  return data
}
