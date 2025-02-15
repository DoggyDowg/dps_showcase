'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AssetLoadingContextType {
  isLoading: boolean
  totalAssets: number
  loadedAssets: number
  registerAsset: () => void
  markAssetAsLoaded: () => void
  resetLoading: () => void
}

const AssetLoadingContext = createContext<AssetLoadingContextType | undefined>(undefined)

const MINIMUM_LOADING_TIME = 2000 // 2 seconds minimum loading time

export function AssetLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [totalAssets, setTotalAssets] = useState(0)
  const [loadedAssets, setLoadedAssets] = useState(0)
  const [loadingStartTime] = useState(Date.now())

  // Reset loading state when all assets are loaded
  useEffect(() => {
    if (totalAssets > 0 && loadedAssets === totalAssets) {
      const timeElapsed = Date.now() - loadingStartTime
      const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - timeElapsed)

      console.log(`[AssetLoading] Loading complete:`, {
        totalAssets,
        loadedAssets,
        timeElapsed,
        remainingTime,
        loadingStartTime,
        currentTime: Date.now()
      })

      // Add a delay to ensure minimum loading time and smooth transition
      const timer = setTimeout(() => {
        console.log('[AssetLoading] Hiding loader after minimum time')
        setIsLoading(false)
      }, remainingTime)

      return () => {
        console.log('[AssetLoading] Cleanup timer')
        clearTimeout(timer)
      }
    }
  }, [totalAssets, loadedAssets, loadingStartTime])

  const registerAsset = () => {
    setTotalAssets(prev => {
      const newTotal = prev + 1
      console.log(`[AssetLoading] Registered new asset:`, {
        previousTotal: prev,
        newTotal,
        currentLoaded: loadedAssets
      })
      return newTotal
    })
  }

  const markAssetAsLoaded = () => {
    setLoadedAssets(prev => {
      const newLoaded = prev + 1
      console.log(`[AssetLoading] Asset loaded:`, {
        previousLoaded: prev,
        newLoaded,
        totalAssets,
        isComplete: newLoaded === totalAssets
      })
      return newLoaded
    })
  }

  const resetLoading = () => {
    console.log('[AssetLoading] Reset loading state:', {
      previousTotal: totalAssets,
      previousLoaded: loadedAssets
    })
    setIsLoading(true)
    setTotalAssets(0)
    setLoadedAssets(0)
  }

  // Log state changes
  useEffect(() => {
    console.log('[AssetLoading] State updated:', {
      isLoading,
      totalAssets,
      loadedAssets,
      progress: totalAssets > 0 ? Math.round((loadedAssets / totalAssets) * 100) : 0
    })
  }, [isLoading, totalAssets, loadedAssets])

  return (
    <AssetLoadingContext.Provider 
      value={{
        isLoading,
        totalAssets,
        loadedAssets,
        registerAsset,
        markAssetAsLoaded,
        resetLoading
      }}
    >
      {children}
    </AssetLoadingContext.Provider>
  )
}

export function useAssetLoading() {
  const context = useContext(AssetLoadingContext)
  if (context === undefined) {
    throw new Error('useAssetLoading must be used within an AssetLoadingProvider')
  }
  return context
} 