'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface ParallaxBannerProps {
  imageSrc: string
  title: string
  loading?: boolean
}

export function ParallaxBanner({ imageSrc, title, loading }: ParallaxBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

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
    <div ref={bannerRef} className="relative h-[160px] w-full overflow-hidden">
      {loading ? (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      ) : (
        <div 
          ref={imageRef} 
          className="absolute -top-[150px] left-0 right-0 h-[460px]"
        >
          <Image
            src={imageSrc}
            alt={`${title} Banner`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
      )}
      <div className="absolute inset-0 bg-brand-dark/50" />
      <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-center">
        <h2 className="text-4xl font-light text-brand-light">{title}</h2>
      </div>
    </div>
  )
} 