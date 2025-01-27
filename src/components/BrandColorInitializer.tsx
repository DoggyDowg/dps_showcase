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

    if (!property) {
      updateBrandColors({
        dark: defaultColors.dark,
        light: defaultColors.light,
        highlight: defaultColors.accent
      })
      return
    }

    // Safely access nested properties with null coalescing and ensure colors object exists
    const colors = property?.agency_settings?.branding?.colors || {
      dark: defaultColors.dark,
      light: defaultColors.light,
      accent: defaultColors.accent
    }
    const agencyColors = {
      dark: colors?.dark || defaultColors.dark,
      light: colors?.light || defaultColors.light,
      accent: colors?.accent || defaultColors.accent
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