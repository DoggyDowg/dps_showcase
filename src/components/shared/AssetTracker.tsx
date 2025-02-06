'use client'

import { useEffect, useRef } from 'react'
import Image, { ImageProps } from 'next/image'
import { useAssetLoading } from '@/contexts/AssetLoadingContext'

interface TrackedImageProps extends Omit<ImageProps, 'onLoad'> {
  onLoadingComplete?: (img: HTMLImageElement) => void
}

interface TrackedVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  onLoadingComplete?: () => void
}

export function TrackedImage({ onLoadingComplete, src, alt, ...props }: TrackedImageProps) {
  const { registerAsset, markAssetAsLoaded } = useAssetLoading()
  const isRegistered = useRef(false)

  useEffect(() => {
    if (!isRegistered.current) {
      console.log(`[TrackedImage] Registering image: ${src}`)
      registerAsset()
      isRegistered.current = true
    }
  }, [registerAsset, src])

  return (
    <Image
      src={src}
      alt={alt}
      {...props}
      onLoadingComplete={(img) => {
        console.log(`[TrackedImage] Image loaded: ${src}`)
        markAssetAsLoaded()
        onLoadingComplete?.(img)
      }}
      onError={() => {
        console.error(`[TrackedImage] Failed to load image: ${src}`)
        markAssetAsLoaded() // Mark as loaded even on error to prevent hanging
      }}
    />
  )
}

export function TrackedVideo({ onLoadingComplete, src, ...props }: TrackedVideoProps) {
  const { registerAsset, markAssetAsLoaded } = useAssetLoading()
  const isRegistered = useRef(false)

  useEffect(() => {
    if (!isRegistered.current) {
      console.log(`[TrackedVideo] Registering video: ${src}`)
      registerAsset()
      isRegistered.current = true
    }
  }, [registerAsset, src])

  return (
    <video
      {...props}
      src={src}
      onLoadedData={() => {
        console.log(`[TrackedVideo] Video loaded: ${src}`)
        markAssetAsLoaded()
        onLoadingComplete?.()
      }}
      onError={() => {
        console.error(`[TrackedVideo] Failed to load video: ${src}`)
        markAssetAsLoaded() // Mark as loaded even on error to prevent hanging
      }}
    />
  )
} 