'use client'

import { useEffect } from 'react'
import { updateBrandColors } from '@/utils/updateBrandColors'
import type { Property } from '@/types/property'

interface BrandColorInitializerProps {
  property: Property | null | undefined
}

export function BrandColorInitializer({ property }: BrandColorInitializerProps) {
  useEffect(() => {
    console.log('BrandColorInitializer: Property received:', property)

    const defaultColors = {
      dark: '#000000',
      light: '#FFFFFF',
      accent: '#000000'
    }

    console.log('BrandColorInitializer: Default colors:', defaultColors)

    // Early return with default colors if any part of the chain is missing
    const colors = property?.agency_settings?.branding?.colors
    console.log('BrandColorInitializer: Agency colors from property:', colors)

    // Log the property chain to identify where it might be breaking
    console.log('BrandColorInitializer: Property chain:', {
      hasAgencySettings: !!property?.agency_settings,
      hasBranding: !!property?.agency_settings?.branding,
      hasColors: !!property?.agency_settings?.branding?.colors,
      darkColor: colors?.dark,
      lightColor: colors?.light,
      accentColor: colors?.accent
    })

    // If any required color is missing or undefined, use default colors
    if (!colors?.dark || !colors?.light) {
      console.log('BrandColorInitializer: Missing required colors, using defaults:', {
        missingDark: !colors?.dark,
        missingLight: !colors?.light,
        appliedColors: {
          dark: defaultColors.dark,
          light: defaultColors.light,
          highlight: defaultColors.accent
        }
      })

      updateBrandColors({
        dark: defaultColors.dark,
        light: defaultColors.light,
        highlight: defaultColors.accent
      })
      return
    }

    // At this point, we know we have valid dark and light colors
    const finalColors = {
      dark: colors.dark,
      light: colors.light,
      highlight: colors.accent || defaultColors.accent
    }

    console.log('BrandColorInitializer: Applying final colors:', finalColors)

    updateBrandColors(finalColors)
  }, [property])

  return null
}