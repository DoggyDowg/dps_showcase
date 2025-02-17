'use client'

import { AssetLoadingProvider } from '@/contexts/AssetLoadingContext'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import Providers from '@/components/shared/Providers'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AssetLoadingProvider>
      <LoadingScreen />
      {children}
      <Providers />
    </AssetLoadingProvider>
  )
}