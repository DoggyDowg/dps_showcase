'use client'

import { useEffect, useRef } from 'react'
import { TrackedImage } from '@/components/shared/AssetTracker'
import { useAssetLoading } from '@/contexts/AssetLoadingContext'

export default function LoadingScreen() {
  const { isLoading, totalAssets, loadedAssets } = useAssetLoading()
  const hasLoggedRef = useRef<boolean>(false)

  // Calculate loading percentage
  const loadingPercentage = totalAssets === 0 ? 0 : Math.round((loadedAssets / totalAssets) * 100)

  // Log when loading screen mounts and unmounts
  useEffect(() => {
    console.log('[LoadingScreen] Mounted:', {
      isLoading,
      totalAssets,
      loadedAssets,
      loadingPercentage
    })

    return () => {
      console.log('[LoadingScreen] Unmounted')
    }
  }, [isLoading, totalAssets, loadedAssets, loadingPercentage])

  // Log when loading state changes
  useEffect(() => {
    console.log('[LoadingScreen] Loading state changed:', {
      isLoading,
      totalAssets,
      loadedAssets,
      loadingPercentage
    })
  }, [isLoading, totalAssets, loadedAssets, loadingPercentage])

  // Log when assets change
  useEffect(() => {
    if (totalAssets > 0 && !hasLoggedRef.current) {
      console.log('[LoadingScreen] Initial assets registered:', {
        totalAssets,
        loadedAssets,
        loadingPercentage
      })
      hasLoggedRef.current = true
    }
  }, [totalAssets, loadedAssets, loadingPercentage])

  if (!isLoading) {
    console.log('[LoadingScreen] Not loading, returning null')
    return null
  }

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
          {loadingPercentage}% ({loadedAssets}/{totalAssets} assets)
        </div>
      </div>
    </div>
  )
}