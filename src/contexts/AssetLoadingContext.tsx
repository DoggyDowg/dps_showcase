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

      console.log(`[AssetLoading] All assets loaded. Waiting ${remainingTime}ms before hiding loader`)

      // Add a delay to ensure minimum loading time and smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, remainingTime)

      return () => clearTimeout(timer)
    }
  }, [totalAssets, loadedAssets, loadingStartTime])

  const registerAsset = () => {
    setTotalAssets(prev => {
      const newTotal = prev + 1
      console.log(`[AssetLoading] Registered new asset. Total: ${newTotal}`)
      return newTotal
    })
  }

  const markAssetAsLoaded = () => {
    setLoadedAssets(prev => {
      const newLoaded = prev + 1
      console.log(`[AssetLoading] Asset loaded. Progress: ${newLoaded}/${totalAssets}`)
      return newLoaded
    })
  }

  const resetLoading = () => {
    console.log('[AssetLoading] Reset loading state')
    setIsLoading(true)
    setTotalAssets(0)
    setLoadedAssets(0)
  }

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