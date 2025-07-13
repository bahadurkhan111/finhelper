/**
 * Create a gradient for chart backgrounds
 */
export function createGradient(
  ctx: CanvasRenderingContext2D | null,
  chartArea: any,
  color: string,
): CanvasGradient | string {
  if (!ctx || !chartArea) {
    return color
  }

  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)

  // Parse the color to get RGB values
  let r = 0,
    g = 0,
    b = 0

  if (color.startsWith("#")) {
    const hex = color.substring(1)
    r = Number.parseInt(hex.substring(0, 2), 16)
    g = Number.parseInt(hex.substring(2, 4), 16)
    b = Number.parseInt(hex.substring(4, 6), 16)
  } else if (color.startsWith("rgb")) {
    const match = color.match(/\d+/g)
    if (match && match.length >= 3) {
      r = Number.parseInt(match[0])
      g = Number.parseInt(match[1])
      b = Number.parseInt(match[2])
    }
  }

  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.5)`)
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.05)`)

  return gradient
}
