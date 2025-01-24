'use client'

import { useState } from 'react'
import { DynamicImage } from './DynamicImage'
import { KeyboardEvent as ReactKeyboardEvent } from 'react'

interface GalleryImage {
  src: string
  alt: string
}

interface GalleryGridProps {
  images: GalleryImage[]
  columns?: number
  gap?: number
  aspectRatio?: string
  className?: string
}

export function GalleryGrid({
  images,
  columns = 2,
  gap = 4,
  aspectRatio = '1/1',
  className = '',
}: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  // Handle keyboard navigation in fullscreen mode
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (selectedImage === null) return

    switch (e.key) {
      case 'ArrowLeft':
        setSelectedImage(prev => (prev === null || prev === 0 ? images.length - 1 : prev - 1))
        break
      case 'ArrowRight':
        setSelectedImage(prev => (prev === null ? 0 : (prev + 1) % images.length))
        break
      case 'Escape':
        setSelectedImage(null)
        break
    }
  }

  return (
    <>
      {/* Grid View */}
      <div
        className={`grid gap-${gap} ${className}`}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {images.map((image, index) => (
          <div
            key={image.src}
            className="relative cursor-pointer transition-transform hover:scale-105"
            style={{ aspectRatio }}
            onClick={() => setSelectedImage(index)}
          >
            <DynamicImage
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {/* Full Screen View */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative w-full max-w-6xl h-[80vh] px-4">
            {/* Previous Button */}
            <button
              className="absolute left-8 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(prev => (prev === null || prev === 0 ? images.length - 1 : prev - 1))
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Button */}
            <button
              className="absolute right-8 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(prev => (prev === null ? 0 : (prev + 1) % images.length))
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              className="absolute top-4 right-8 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="relative h-full">
              <DynamicImage
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 