// Helper function to convert hex to RGB
import type { BrandColors } from '@/types/brand'

const hexToRgb = (hex: string) => {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) {
      throw new Error(`Invalid hex color: ${hex}`)
    }
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  } catch (error) {
    throw new Error(`Failed to convert hex to RGB: ${hex} - ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const updateBrandColors = (colors: BrandColors) => {
  if (typeof document === 'undefined') {
    throw new Error('updateBrandColors: Document is undefined')
  }

  if (!colors) {
    throw new Error('updateBrandColors: Colors object is undefined')
  }

  if (!colors.dark || !colors.light) {
    throw new Error(`updateBrandColors: Required colors missing - dark: ${colors.dark}, light: ${colors.light}`)
  }

  const root = document.documentElement
  
  try {
    // Set main color variables
    root.style.setProperty('--brand-dark', colors.dark)
    root.style.setProperty('--brand-light', colors.light)
    root.style.setProperty('--brand-highlight', colors.highlight ?? colors.dark)
    
    // Set RGB values
    const darkRgb = hexToRgb(colors.dark)
    const lightRgb = hexToRgb(colors.light)
    
    if (darkRgb) root.style.setProperty('--brand-dark-rgb', darkRgb)
    if (lightRgb) root.style.setProperty('--brand-light-rgb', lightRgb)

    // Return the final values for debugging
    return {
      '--brand-dark': root.style.getPropertyValue('--brand-dark'),
      '--brand-light': root.style.getPropertyValue('--brand-light'),
      '--brand-highlight': root.style.getPropertyValue('--brand-highlight'),
      '--brand-dark-rgb': root.style.getPropertyValue('--brand-dark-rgb'),
      '--brand-light-rgb': root.style.getPropertyValue('--brand-light-rgb')
    }
  } catch (error) {
    throw new Error(`updateBrandColors: Error updating brand colors - ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
