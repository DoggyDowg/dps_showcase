// Helper function to convert hex to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? 
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
    null
}

interface BrandColors {
  dark: string
  light: string
  highlight?: string
}

export const updateBrandColors = (colors: BrandColors) => {
  if (typeof document === 'undefined') return

  console.log('Updating brand colors:', colors)

  const root = document.documentElement
  root.style.setProperty('--brand-dark', colors.dark)
  root.style.setProperty('--brand-light', colors.light)
  root.style.setProperty('--brand-highlight', colors.highlight ?? colors.dark)
  
  // Set RGB values
  const darkRgb = hexToRgb(colors.dark)
  const lightRgb = hexToRgb(colors.light)
  if (darkRgb) root.style.setProperty('--brand-dark-rgb', darkRgb)
  if (lightRgb) root.style.setProperty('--brand-light-rgb', lightRgb)

  console.log('Updated CSS variables:', {
    '--brand-dark': root.style.getPropertyValue('--brand-dark'),
    '--brand-light': root.style.getPropertyValue('--brand-light'),
    '--brand-highlight': root.style.getPropertyValue('--brand-highlight'),
    '--brand-dark-rgb': root.style.getPropertyValue('--brand-dark-rgb'),
    '--brand-light-rgb': root.style.getPropertyValue('--brand-light-rgb')
  })
}
