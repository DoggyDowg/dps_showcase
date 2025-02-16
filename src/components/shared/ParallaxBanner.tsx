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
  const scrollListenerRef = useRef<(() => void) | null>(null)

  // Register this banner's image as an asset to load
  useEffect(() => {
    if (!loading && imageSrc) {
      console.log('[ParallaxBanner] Registering asset:', imageSrc)
      registerAsset()
    }
  }, [loading, imageSrc, registerAsset])

  // Reset image loaded state when source changes
  useEffect(() => {
    setIsImageLoaded(false)
  }, [imageSrc])

  // Handle scroll effects
  useEffect(() => {
    if (!isImageLoaded || !bannerRef.current || !imageRef.current) {
      console.log('[ParallaxBanner] Not ready for scroll effects:', {
        isImageLoaded,
        hasBannerRef: !!bannerRef.current,
        hasImageRef: !!imageRef.current
      })
      return
    }

    console.log('[ParallaxBanner] Setting up scroll handler')
    
    const handleScroll = () => {
      if (!bannerRef.current || !imageRef.current) return
      
      const rect = bannerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      
      // Only apply parallax when banner is in view
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height)
        const parallaxOffset = Math.min(Math.max(scrollProgress * 100 - 50, -50), 50)
        imageRef.current.style.transform = `translateY(${parallaxOffset}px)`
      }
    }

    // Store the handler reference for cleanup
    scrollListenerRef.current = handleScroll

    // Initial position
    handleScroll()

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup
    return () => {
      console.log('[ParallaxBanner] Cleaning up scroll handler')
      if (scrollListenerRef.current) {
        window.removeEventListener('scroll', scrollListenerRef.current)
        scrollListenerRef.current = null
      }
    }
  }, [isImageLoaded])

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
                console.log('[ParallaxBanner] Image loaded:', imageSrc)
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