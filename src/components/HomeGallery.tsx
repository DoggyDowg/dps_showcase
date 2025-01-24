import { useState } from 'react'
import Image from 'next/image'
import paginationStyles from '@/styles/Pagination.module.css'
import type { Property } from '@/types/property'
import { useGalleryImages } from '@/hooks/useGalleryImages'

interface HomeGalleryProps {
  property: Property
}

export function HomeGallery({ property }: HomeGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [transitionClass, setTransitionClass] = useState<'transitionPrev' | 'transitionNext' | ''>('')
  const { images, loading } = useGalleryImages(property.id)

  const handleSlideTransition = (direction: 'prev' | 'next') => {
    if (!images?.length) return
    const newIndex = direction === 'prev' 
      ? currentIndex === 0 ? images.length - 1 : currentIndex - 1
      : (currentIndex + 1) % images.length

    setCurrentIndex(newIndex)
  }

  const handlePagination = (direction: 'prev' | 'next') => {
    setTransitionClass(direction === 'prev' ? 'transitionPrev' : 'transitionNext')
    setTimeout(() => {
      setTransitionClass('')
    }, 500)
  }

  if (loading) {
    return (
      <div className="relative w-full h-[300px] bg-gray-200 animate-pulse" />
    )
  }

  if (!images?.length) {
    return null
  }

  const currentImage = images[currentIndex]
  const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage.src

  return (
    <div className="flex flex-col w-full">
      {/* Main Image Container */}
      <div className="relative h-[300px]">
        <div className="h-full flex items-center justify-center px-16">
          <div className="relative w-[1000px] h-full">
            <Image
              src={imageUrl}
              alt={typeof currentImage === 'string' ? `Gallery image ${currentIndex + 1}` : currentImage.alt}
              fill
              className="object-contain"
              sizes="(max-width: 1200px) 100vw, 1000px"
              priority
            />
          </div>
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-brand-light bg-brand-dark/50 px-4 py-1 rounded-full text-sm backdrop-blur-sm z-[60]">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Custom Pagination */}
      <div>
        <div className={`${paginationStyles.paginationWrapper} ${transitionClass ? paginationStyles[transitionClass] : ''} !mt-4 !pb-0`}>
          {/* Prev Button */}
          <svg 
            className={paginationStyles.btn} 
            height="48" 
            viewBox="0 0 24 24" 
            width="48" 
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => {
              handleSlideTransition('prev')
              handlePagination('prev')
            }}
          >
            <path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>
          </svg>

          <div className={paginationStyles.paginationContainer}>
            <div className={`${paginationStyles.littleDot} ${paginationStyles.littleDotFirst}`} />
            <div className={paginationStyles.littleDot}>
              <div className={paginationStyles.bigDotContainer}>
                <div className={paginationStyles.bigDot} />
              </div>
            </div>
            <div className={`${paginationStyles.littleDot} ${paginationStyles.littleDotLast}`} />
          </div>

          {/* Next Button */}
          <svg 
            className={paginationStyles.btn} 
            height="48" 
            viewBox="0 0 24 24" 
            width="48" 
            xmlns="http://www.w3.org/2000/svg"
            onClick={() => {
              handleSlideTransition('next')
              handlePagination('next')
            }}
          >
            <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
          </svg>
        </div>
      </div>
    </div>
  )
} 