'use client'

import { BrandColorInitializer } from '@/components/BrandColorInitializer'
import { BrandFontInitializer } from '@/components/BrandFontInitializer'
import { AssetLoadingProvider } from '@/contexts/AssetLoadingContext'
import LoadingScreen from '@/components/shared/LoadingScreen'
import type { Property } from '@/types/property'

interface ClientLayoutProps {
  property: Property
  children: React.ReactNode
}

export function ClientLayout({ property, children }: ClientLayoutProps) {
  return (
    <AssetLoadingProvider>
      <LoadingScreen />
      <BrandColorInitializer property={property} />
      <BrandFontInitializer property={property} />
      {children}
    </AssetLoadingProvider>
  )
}