'use client'

import { AssetLoadingProvider } from '@/contexts/AssetLoadingContext'
import LoadingScreen from '@/components/shared/LoadingScreen'
import Providers from '@/components/shared/Providers'
import type { Property } from '@/types/property'

interface ClientLayoutProps {
  children: React.ReactNode
  property?: Property
}

export default function ClientLayout({
  children,
  property
}: ClientLayoutProps) {
  return (
    <AssetLoadingProvider>
      <LoadingScreen property={property} />
      {children}
      <Providers />
    </AssetLoadingProvider>
  )
}