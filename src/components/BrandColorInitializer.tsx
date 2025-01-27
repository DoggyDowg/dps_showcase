'use client'

import { useEffect } from 'react'
import { updateBrandColors } from '@/utils/updateBrandColors'
import type { Property } from '@/types/property'

interface BrandColorInitializerProps {
  property: Property | null | undefined
}

const defaultColors = {
  dark: '#000000',
  light: '#FFFFFF',
  accent: '#000000'
}

export function BrandColorInitializer({ property }: BrandColorInitializerProps) {
  useEffect(() => {
    try {
      console.log('BrandColorInitializer: Initializing with property:', property)

      // Early return with default colors if property is null or undefined
      if (!property) {
        console.log('BrandColorInitializer: No property data, using default colors')
        updateBrandColors({
          dark: defaultColors.dark,
          light: defaultColors.light,
          highlight: defaultColors.accent
        })
        return
      }

      console.log('BrandColorInitializer: Agency settings:', property.agency_settings)

      // Early return with default colors if agency_settings is missing
      if (!property.agency_settings) {
        console.log('BrandColorInitializer: No agency settings, using default colors')
        updateBrandColors({
          dark: defaultColors.dark,
          light: defaultColors.light,
          highlight: defaultColors.accent
        })
        return
      }

      console.log('BrandColorInitializer: Agency branding:', property.agency_settings.branding)

      // Early return with default colors if branding is missing
      if (!property.agency_settings.branding) {
        console.log('BrandColorInitializer: No branding data, using default colors')
        updateBrandColors({
          dark: defaultColors.dark,
          light: defaultColors.light,
          highlight: defaultColors.accent
        })
        return
      }

      // Early return with default colors if colors object is missing
      const colors = property.agency_settings.branding.colors
      console.log('BrandColorInitializer: Brand colors:', colors)

      if (!colors) {
        console.log('BrandColorInitializer: No colors object, using default colors')
        updateBrandColors({
          dark: defaultColors.dark,
          light: defaultColors.light,
          highlight: defaultColors.accent
        })
        return
      }

      // If any required color is missing or undefined, use default colors
      if (!colors.dark || !colors.light) {
        console.log('BrandColorInitializer: Missing required colors, using default colors')
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
        highlight: colors.highlight || defaultColors.accent
      }

      console.log('BrandColorInitializer: Applying final colors:', finalColors)
      const result = updateBrandColors(finalColors)
      console.log('BrandColorInitializer: Colors applied successfully:', result)
    } catch (error) {
      console.error('BrandColorInitializer: Error occurred:', error)
      
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