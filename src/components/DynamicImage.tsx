'use client'

import Image from 'next/image'
import { useState } from 'react'

interface DynamicImageProps {
  src: string
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

  if (error || !src) {
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
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  )
} 