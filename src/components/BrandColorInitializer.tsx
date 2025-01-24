'use client'

import { useEffect } from 'react'
import { updateBrandColors } from '@/utils/updateBrandColors'
import type { Property } from '@/types/property'

interface BrandColorInitializerProps {
  property: Property
}

export function BrandColorInitializer({ property }: BrandColorInitializerProps) {
  useEffect(() => {
    if (property?.agency_settings?.branding?.colors) {
      const colors = property.agency_settings.branding.colors
      console.log('Setting brand colors:', colors)
      updateBrandColors({
        dark: colors.text || colors.primary,
        light: colors.background || colors.secondary,
        highlight: colors.accent
      })
    }
  }, [property])

  return null
}