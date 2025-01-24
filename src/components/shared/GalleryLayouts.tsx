'use client'

import { DynamicImage } from './DynamicImage'

interface GalleryImage {
  src: string
  alt: string
}

interface GalleryProps {
  images: GalleryImage[]
  onImageClick: (index: number) => void
}

// Classic Grid - Equal sized thumbnails
export function ClassicGrid({ images, onImageClick }: GalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div
          key={image.src}
          className="relative aspect-square cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick(index)}
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
  )
}

// Featured Layout - One large image with smaller thumbnails
export function FeaturedLayout({ images, onImageClick }: GalleryProps) {
  if (images.length === 0) return null
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Featured Image */}
      <div 
        className="relative col-span-2 row-span-2 aspect-square cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onImageClick(0)}
      >
        <DynamicImage
          src={images[0].src}
          alt={images[0].alt}
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>
      
      {/* Smaller Images */}
      {images.slice(1, 5).map((image, index) => (
        <div
          key={image.src}
          className="relative aspect-square cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick(index + 1)}
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
  )
}

// Metro Style - Grid with some images spanning multiple cells
export function MetroLayout({ images, onImageClick }: GalleryProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => {
        // Make some images span multiple cells
        const isLarge = index === 0 || index === 3 || index === 5
        return (
          <div
            key={image.src}
            className={`relative cursor-pointer hover:opacity-90 transition-opacity
              ${isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
            `}
            style={{ aspectRatio: isLarge ? '16/9' : '1/1' }}
            onClick={() => onImageClick(index)}
          >
            <DynamicImage
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover rounded-lg"
              priority={index === 0}
            />
          </div>
        )
      })}
    </div>
  )
}

// Horizontal Scroll - Carousel style
export function HorizontalScroll({ images, onImageClick }: GalleryProps) {
  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {images.map((image, index) => (
          <div
            key={image.src}
            className="relative flex-none w-80 aspect-video cursor-pointer hover:opacity-90 transition-opacity snap-start"
            onClick={() => onImageClick(index)}
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
    </div>
  )
}

// Masonry Layout (simplified version)
export function MasonryLayout({ images, onImageClick }: GalleryProps) {
  return (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {images.map((image, index) => (
        <div
          key={image.src}
          className="relative break-inside-avoid cursor-pointer hover:opacity-90 transition-opacity"
          style={{ aspectRatio: index % 2 === 0 ? '3/4' : '4/3' }}
          onClick={() => onImageClick(index)}
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
  )
} 