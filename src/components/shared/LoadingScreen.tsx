'use client'

import { useEffect } from 'react'
import { TrackedImage } from '@/components/shared/AssetTracker'
import { useAssetLoading } from '@/contexts/AssetLoadingContext'

export default function LoadingScreen() {
  const { isLoading, totalAssets, loadedAssets } = useAssetLoading()

  // Calculate loading percentage
  const loadingPercentage = totalAssets === 0 ? 0 : Math.round((loadedAssets / totalAssets) * 100)

  // Ensure loading screen shows for at least 2 seconds
  useEffect(() => {
    if (totalAssets === 0) {
      // Register the logo as an asset
      const timer = setTimeout(() => {
        // This will trigger initial asset registration
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [totalAssets])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-6 z-[9999]">
      <div className="w-64 h-24 relative mb-4">
        <TrackedImage
          src="/logos/dps_whitebg.png"
          alt="Digital Property Showcase"
          fill
          sizes="(max-width: 256px) 100vw, 256px"
          className="object-contain"
          priority
          onError={() => console.error('[LoadingScreen] Failed to load logo')}
        />
      </div>
      
      {/* Loading Progress */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-xl mb-2">Loading demonstration...</div>
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-dark transition-all duration-300 ease-out rounded-full"
            style={{ width: `${loadingPercentage}%` }}
          />
        </div>
        <div className="text-sm text-gray-600">
          {loadingPercentage}%
        </div>
      </div>
    </div>
  )
}