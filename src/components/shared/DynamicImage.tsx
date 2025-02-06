'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getImageWithFallback } from '@/utils/imageUtils'

interface DynamicImageProps {
  src: string          // Base path without extension (e.g., '/images/gallery/photo1')
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
}

export function DynamicImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
}: DynamicImageProps) {
  const [error, setError] = useState(false)

  // Check if the URL is a Supabase URL
  const isSupabaseUrl = src.includes('supabase.co') || src.includes('supabase.in')
  const srcSet = isSupabaseUrl ? [src] : getImageWithFallback(src)
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