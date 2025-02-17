'use client'

import Image from 'next/image'
import { useAssetLoading } from '@/contexts/AssetLoadingContext'
import type { Property } from '@/types/property'

interface LoadingScreenProps {
  property?: Property
}

export default function LoadingScreen({ property }: LoadingScreenProps) {
  const { isLoading, totalAssets, loadedAssets } = useAssetLoading()

  // Calculate loading percentage
  const loadingPercentage = totalAssets === 0 ? 0 : Math.round((loadedAssets / totalAssets) * 100)

  if (!isLoading) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-6 z-[9999]">
      <div className="w-64 h-24 relative mb-4">
        <Image
          src={property?.agency_settings?.branding?.logo?.dark || "/logos/dps_whitebg.png"}
          alt={property?.agency_name || "Digital Property Showcase"}
          fill
          sizes="(max-width: 256px) 100vw, 256px"
          className="object-contain"
          priority
        />
      </div>
      
      {/* Loading Progress */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-xl mb-2">Loading {property?.name ? `${property.name}...` : 'demonstration...'}</div>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-dark transition-all duration-300 ease-out rounded-full"
            style={{ width: `${loadingPercentage}%` }}
          />
        </div>
        <div className="text-sm text-gray-600">
          {loadingPercentage}% ({loadedAssets}/{totalAssets} assets)
        </div>
      </div>
    </div>
  )
}