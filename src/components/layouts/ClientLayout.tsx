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
  console.log('[ClientLayout] Property data:', {
    id: property.id,
    is_demo: property.is_demo,
    // Add other relevant properties here
  });

  return (
    <AssetLoadingProvider>
      {/* Only show loading screen for demo properties */}
      {property.is_demo === true && <LoadingScreen />}
      <BrandColorInitializer property={property} />
      <BrandFontInitializer property={property} />
      {children}
    </AssetLoadingProvider>
  )
}