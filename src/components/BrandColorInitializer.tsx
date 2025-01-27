'use client'

import { useEffect } from 'react'
import { updateBrandColors } from '@/utils/updateBrandColors'
import type { Property } from '@/types/property'

interface BrandColorInitializerProps {
  property: Property
}

export function BrandColorInitializer({ property }: BrandColorInitializerProps) {
  useEffect(() => {
    const colors = property?.agency_settings?.branding?.colors
    const defaultColors = {
      dark: '#000000',
      light: '#FFFFFF',
      accent: '#000000'
    }

    console.log('Brand colors from property:', colors)

    updateBrandColors({
      dark: colors?.dark || defaultColors.dark,
      light: colors?.light || defaultColors.light,
      highlight: colors?.accent || defaultColors.accent
    })
  }, [property])

  return null
}