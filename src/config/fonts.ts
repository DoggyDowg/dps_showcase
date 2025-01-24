import localFont from 'next/font/local'

// Load fonts from the public directory
export const headingFont = localFont({
  src: '../../public/fonts/heading/SangBleuEmpire-Medium-WebS.woff2',
  variable: '--font-heading',
})

export const paragraphFont = localFont({
  src: '../../public/fonts/paragraph/Euclid Circular A Regular.ttf',
  variable: '--font-paragraph',
}) 