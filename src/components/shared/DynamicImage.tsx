'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getImageWithFallback } from '@/utils/imageUtils'
import { getAssetUrl } from '@/utils/getAssetUrl'
import type { AssetCategory } from '@/types/assets'

interface DynamicImageProps {
  src: string          // Base path without extension (e.g., '/images/gallery/photo1')
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  // New props for asset URLs
  propertyId?: string
  isDemo?: boolean
  category?: AssetCategory
  filename?: string
}

export function DynamicImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  propertyId,
  isDemo,
  category,
  filename,
}: DynamicImageProps) {
  const [error, setError] = useState(false)

  // If propertyId and category are provided, use the asset URL system
  const actualSrc = propertyId && category && filename
    ? getAssetUrl({ propertyId, isDemo, category, filename })
    : src

  // Check if the URL is a Supabase URL
  const isSupabaseUrl = actualSrc.includes('supabase.co') || actualSrc.includes('supabase.in')
  const srcSet = isSupabaseUrl ? [actualSrc] : getImageWithFallback(actualSrc)
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0)

  const handleError = () => {
    if (currentSrcIndex < srcSet.length - 1) {
      setCurrentSrcIndex(prev => prev + 1)
    } else {
      setError(true)
    }
  }

  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={fill ? { position: 'relative', width: '100%', height: '100%' } : { width, height }}
      >
        <span className="text-gray-400 text-sm">Image not found</span>
      </div>
    )
  }

  return (
    <Image
      src={srcSet[currentSrcIndex]}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      onError={handleError}
    />
  )
} 