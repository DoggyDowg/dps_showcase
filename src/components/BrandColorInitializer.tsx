'use client'

import { useEffect } from 'react'
import { updateBrandColors } from '@/utils/updateBrandColors'
import type { Property, AgencyBranding } from '@/types/property'

interface BrandColorInitializerProps {
  property: Property | null | undefined
}

const defaultColors: AgencyBranding['colors'] = {
  dark: '#000000',
  light: '#FFFFFF',
  accent: '#000000'
}

const BrandColorInitializer = ({ property }: BrandColorInitializerProps) => {
  useEffect(() => {
    try {
      console.error('[BrandColor] Initializing with property:', property)

      // Get colors with strong null checks and fallbacks
      const colors = (property?.agency_settings?.branding?.colors || defaultColors) as AgencyBranding['colors']
      const dark = colors.dark ?? defaultColors.dark
      const light = colors.light ?? defaultColors.light
      const accent = colors.accent ?? defaultColors.accent

      console.error('[BrandColor] Resolved colors:', { dark, light, accent })

      // Validate colors before applying
      if (!dark || !light) {
        throw new Error('Required colors missing or invalid')
      }

      // Apply the validated colors
      const result = updateBrandColors({
        dark,
        light,
        highlight: accent
      })

      console.error('[BrandColor] Colors applied successfully:', result)
    } catch (error) {
      console.error('[BrandColor] Error:', error)
      
      // In case of any error, fall back to default colors
      updateBrandColors({
        dark: defaultColors.dark,
        light: defaultColors.light,
        highlight: defaultColors.accent
      })
    }
  }, [property])

  return null
}

export { BrandColorInitializer }