'use client'

import { useEffect } from 'react'
import { updateBrandColors } from '@/utils/updateBrandColors'
import type { Property } from '@/types/property'

interface BrandColorInitializerProps {
  property: Property | null | undefined
}

export function BrandColorInitializer({ property }: BrandColorInitializerProps) {
  useEffect(() => {
    const defaultColors = {
      dark: '#000000',
      light: '#FFFFFF',
      accent: '#000000'
    }

    // If property is null/undefined or agency_settings is null/undefined, use default colors
    if (!property || !property.agency_settings) {
      updateBrandColors({
        dark: defaultColors.dark,
        light: defaultColors.light,
        highlight: defaultColors.accent
      })
      return
    }

    // Safely access branding colors with multiple null checks
    const branding = property.agency_settings.branding
    const colors = branding?.colors

    // If no branding colors are set, use defaults
    if (!colors) {
      updateBrandColors({
        dark: defaultColors.dark,
        light: defaultColors.light,
        highlight: defaultColors.accent
      })
      return
    }

    // Use agency colors with fallbacks for each individual color
    const agencyColors = {
      dark: colors.dark || defaultColors.dark,
      light: colors.light || defaultColors.light,
      accent: colors.accent || defaultColors.accent
    }
    
    console.log('Brand colors from property:', agencyColors)

    // Update brand colors with guaranteed valid values
    updateBrandColors({
      dark: agencyColors.dark,
      light: agencyColors.light,
      highlight: agencyColors.accent
    })
  }, [property])

  return null
}