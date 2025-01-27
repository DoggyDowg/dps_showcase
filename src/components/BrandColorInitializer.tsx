'use client'

import { useEffect } from 'react'
import { updateBrandColors } from '@/utils/updateBrandColors'
import type { Property } from '@/types/property'

interface BrandColorInitializerProps {
  property: Property | null | undefined
}

export function BrandColorInitializer({ property }: BrandColorInitializerProps) {
  useEffect(() => {
    try {
      const defaultColors = {
        dark: '#000000',
        light: '#FFFFFF',
        accent: '#000000'
      }

      // Early return with default colors if property is null or undefined
      if (!property) {
        updateBrandColors({
          dark: defaultColors.dark,
          light: defaultColors.light,
          highlight: defaultColors.accent
        })
        return
      }

      // Early return with default colors if agency_settings is missing
      if (!property.agency_settings) {
        updateBrandColors({
          dark: defaultColors.dark,
          light: defaultColors.light,
          highlight: defaultColors.accent
        })
        return
      }

      // Early return with default colors if branding is missing
      if (!property.agency_settings.branding) {
        updateBrandColors({
          dark: defaultColors.dark,
          light: defaultColors.light,
          highlight: defaultColors.accent
        })
        return
      }

      // Early return with default colors if colors object is missing
      const colors = property.agency_settings.branding.colors
      if (!colors) {
        updateBrandColors({
          dark: defaultColors.dark,
          light: defaultColors.light,
          highlight: defaultColors.accent
        })
        return
      }

      // If any required color is missing or undefined, use default colors
      if (!colors.dark || !colors.light) {
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

      updateBrandColors(finalColors)
    } catch (error) {
      // In case of any error, fall back to default colors
      const defaultColors = {
        dark: '#000000',
        light: '#FFFFFF',
        accent: '#000000'
      }

      updateBrandColors({
        dark: defaultColors.dark,
        light: defaultColors.light,
        highlight: defaultColors.accent
      })

      // Log error to error monitoring service if available
      console.error('Error in BrandColorInitializer:', error)
    }
  }, [property])

  return null
}