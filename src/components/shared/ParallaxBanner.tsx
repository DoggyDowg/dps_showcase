'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useAssetLoading } from '@/contexts/AssetLoadingContext'

interface ParallaxBannerProps {
  imageSrc: string
  title: string
  loading?: boolean
}

export function ParallaxBanner({ imageSrc, title, loading = false }: ParallaxBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const { registerAsset, markAssetAsLoaded } = useAssetLoading()

  // Register this banner's image as an asset to load
  useEffect(() => {
    if (!loading && imageSrc) {
      registerAsset()
    }
  }, [loading, imageSrc, registerAsset])

  useEffect(() => {
    const banner = bannerRef.current
    const image = imageRef.current
    if (!banner || !image || !isImageLoaded) return

    const handleScroll = () => {
      const rect = banner.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Only apply parallax when banner is in extended viewport
      if (rect.top < viewportHeight + 200 && rect.bottom > -200) {
        const distanceFromCenter = rect.top - (viewportHeight / 2)
        const parallaxOffset = Math.min(Math.max(distanceFromCenter * 0.2, -150), 150)
        image.style.transform = `translateY(${parallaxOffset}px)`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isImageLoaded])

  // Reset image loaded state when image source changes
  useEffect(() => {
    setIsImageLoaded(false)
  }, [imageSrc])

  return (
    <div ref={bannerRef} className="relative h-[160px] w-full overflow-hidden bg-brand-dark">
      {loading ? (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      ) : (
        <div className="absolute inset-0">
          {/* Image container */}
          <div 
            ref={imageRef} 
            className="absolute -top-[150px] left-0 right-0 h-[460px] overflow-hidden"
          >
            <Image
              src={imageSrc}
              alt={title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              onLoad={() => {
                setIsImageLoaded(true)
                markAssetAsLoaded()
              }}
            />
          </div>
          {/* Overlay */}
          <div className="absolute inset-0 bg-brand-dark/50" />
        </div>
      )}
      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-brand-light tracking-wider">
          {title}
        </h2>
      </div>
    </div>
  )
}