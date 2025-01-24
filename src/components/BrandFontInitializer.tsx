'use client'

import { useEffect } from 'react'
import type { Property } from '@/types/property'

interface BrandFontInitializerProps {
  property: Property
}

export function BrandFontInitializer({ property }: BrandFontInitializerProps) {
  useEffect(() => {
    if (!property?.agency_settings?.branding?.typography) {
      return
    }

    const { bodyFont, headingFont } = property.agency_settings.branding.typography
    
    async function loadFonts() {
      try {
        // Load body font
        const bodyFontResponse = await fetch(bodyFont.url)
        if (!bodyFontResponse.ok) {
          throw new Error(`Failed to fetch body font: ${bodyFontResponse.status} ${bodyFontResponse.statusText}`)
        }
        const bodyFontBlob = await bodyFontResponse.blob()
        const bodyFontUrl = URL.createObjectURL(bodyFontBlob)

        // Load heading font
        const headingFontResponse = await fetch(headingFont.url)
        if (!headingFontResponse.ok) {
          throw new Error(`Failed to fetch heading font: ${headingFontResponse.status} ${headingFontResponse.statusText}`)
        }
        const headingFontBlob = await headingFontResponse.blob()
        const headingFontUrl = URL.createObjectURL(headingFontBlob)

        // Create style element
        const style = document.createElement('style')
        style.textContent = `
          @font-face {
            font-family: 'Agency Body Font';
            src: url('${bodyFontUrl}') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'Agency Heading Font';
            src: url('${headingFontUrl}') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }

          :root {
            --font-paragraph: 'Agency Body Font', system-ui, sans-serif;
            --font-heading: 'Agency Heading Font', system-ui, sans-serif;
          }
        `

        document.head.appendChild(style)

        return () => {
          document.head.removeChild(style)
          URL.revokeObjectURL(bodyFontUrl)
          URL.revokeObjectURL(headingFontUrl)
        }
      } catch {
        return () => {}
      }
    }

    const cleanup = loadFonts()
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [property?.agency_settings?.branding?.typography])

  return null
} 