'use client'

import { useState, useRef, useEffect } from 'react'
import { useGalleryImages } from '@/hooks/useGalleryImages'
import { FullscreenGallery } from './FullscreenGallery'
import type { Property } from '@/types/property'
import Image from 'next/image'

interface AutoScrollGalleryProps {
  property: Property
}

const VISIBLE_BUFFER = 5 // Number of images to render before/after visible range

export function AutoScrollGallery({ property }: AutoScrollGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: VISIBLE_BUFFER * 2 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimestampRef = useRef<number>(0)
  const { images, loading } = useGalleryImages(property.id, property.is_demo)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            observer.unobserve(entry.target)
          }
        }
      })
    }, options)

    const images = scrollRef.current?.querySelectorAll('img[data-src]') || []
    images.forEach(img => observer.observe(img))

    return () => observer.disconnect()
  }, [images])

  // Update visible range based on scroll position
  useEffect(() => {
    const updateVisibleRange = () => {
      if (!scrollRef.current) return

      const container = scrollRef.current
      const scrollLeft = container.scrollLeft
      const containerWidth = container.clientWidth
      const itemWidth = 288 // w-72
      
      const start = Math.max(0, Math.floor(scrollLeft / itemWidth) - VISIBLE_BUFFER)
      const end = Math.min(
        (images?.length || 0) * 2,
        Math.ceil((scrollLeft + containerWidth) / itemWidth) + VISIBLE_BUFFER
      )

      setVisibleRange({ start, end })
    }

    const container = scrollRef.current
    if (container) {
      container.addEventListener('scroll', updateVisibleRange)
      updateVisibleRange()
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateVisibleRange)
      }
    }
  }, [images])

  // Auto-scroll functionality with requestAnimationFrame
  useEffect(() => {
    if (loading || !images?.length || isPaused) return

    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const speed = 0.1 // pixels per millisecond

    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp
      const elapsed = timestamp - lastTimestampRef.current

      if (scrollContainer) {
        scrollContainer.scrollLeft += speed * elapsed
        
        // Reset scroll position when reaching the end
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0
        }
      }

      lastTimestampRef.current = timestamp
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [loading, images, isPaused])

  // Loading state with proper skeleton UI
  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden px-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-none w-72 h-48 bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    )
  }

  // Empty state
  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No gallery images available</p>
      </div>
    )
  }

  return (
    <>
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden relative px-4 py-2 -mx-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Double the images to create a seamless loop */}
        {[...images, ...images].map((image, index) => {
          // Only render images within the visible range
          if (index < visibleRange.start || index > visibleRange.end) {
            return (
              <div
                key={`${image.id}-${index}`}
                className="flex-none w-72 h-48"
              />
            )
          }

          return (
            <div
              key={`${image.id}-${index}`}
              className="flex-none w-72 relative cursor-pointer group"
              onClick={() => setSelectedImageIndex(index % images.length)}
            >
              <div className="relative h-48 overflow-hidden rounded-lg">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 288px"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  priority={index < 4} // Prioritize loading first 4 images
                  loading={index < 4 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Fullscreen Gallery */}
      {selectedImageIndex !== null && (
        <FullscreenGallery
          images={images}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </>
  )
} 