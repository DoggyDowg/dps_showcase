'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface ParallaxBannerProps {
  imageSrc: string
  title: string
  loading?: boolean
}

export function ParallaxBanner({ imageSrc, title, loading = false }: ParallaxBannerProps) {
  const [offset, setOffset] = useState(0)
  const bannerRef = useRef<HTMLDivElement>(null)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          if (bannerRef.current) {
            const rect = bannerRef.current.getBoundingClientRect()
            const scrolled = window.scrollY
            const rate = scrolled * 0.5
            const newOffset = Math.min(rate, 500) // Limit the parallax effect
            setOffset(newOffset)
          }
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div 
      ref={bannerRef}
      className="relative h-[50vh] min-h-[400px] max-h-[600px] w-full overflow-hidden bg-brand-dark"
    >
      {loading ? (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      ) : (
        <div 
          className="absolute inset-0 transform"
          style={{ 
            transform: `translateY(${offset}px)`,
            willChange: 'transform'
          }}
        >
          <Image
            src={imageSrc}
            alt={title}
            fill
            priority
            className="object-cover scale-[1.5]"
          />
          <div className="absolute inset-0 bg-brand-dark/50" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-brand-light tracking-wider">
          {title}
        </h2>
      </div>
    </div>
  )
}