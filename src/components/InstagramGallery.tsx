'use client'

import { useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import { FullscreenGallery } from './FullscreenGallery'
import styles from '@/styles/TransitionGallery.module.css'
import type { Property } from '@/types/property'

// Mock Instagram post type
interface InstagramPost {
  id: string
  imageUrl: string
  caption: string
  username: string
  timestamp: string
  likes: number
  hashtag: string
}

// Mock data for development and review
const MOCK_INSTAGRAM_POSTS: InstagramPost[] = [
  {
    id: '1',
    imageUrl: '/images/mock/instagram-1.jpg',
    caption: 'Beautiful property at 161 Wooralla Street #161woorallastreet',
    username: 'realtor_jane',
    timestamp: '2024-01-16T08:00:00Z',
    likes: 45,
    hashtag: '#161woorallastreet'
  },
  {
    id: '2',
    imageUrl: '/images/mock/instagram-2.jpg',
    caption: 'Amazing kitchen views #161woorallastreet',
    username: 'home_lover',
    timestamp: '2024-01-15T15:30:00Z',
    likes: 32,
    hashtag: '#161woorallastreet'
  },
  // Add more mock posts as needed
]

interface InstagramGalleryProps {
  property: Property
  hashtag: string
}

export function InstagramGallery({ hashtag }: InstagramGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.15,
    triggerOnce: true,
    rootMargin: '-50px 0px'
  })
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const posts = MOCK_INSTAGRAM_POSTS

  // Scroll the gallery left or right
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const itemWidth = container.firstElementChild?.clientWidth || 0
    const gap = 16
    const scrollAmount = itemWidth + gap

    let newScroll = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    if (direction === 'left' && newScroll < 0) {
      newScroll = container.scrollWidth - container.clientWidth
    } else if (direction === 'right' && newScroll + container.clientWidth > container.scrollWidth) {
      newScroll = 0
    }

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    })
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleCloseFullscreen = () => {
    setSelectedImageIndex(null)
  }

  return (
    <>
      <section ref={sectionRef} className="relative py-16 bg-brand-dark">
        <h2 className="text-center text-2xl font-bold text-brand-light mb-8">
          Instagram #{hashtag}
        </h2>
        
        <div className="relative w-full overflow-hidden px-6 sm:px-8 lg:px-12">
          {/* Left Chevron */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-brand-light hover:bg-brand-light/90 text-brand-dark w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Instagram Posts */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-2 px-1 mx-auto max-w-[1400px]"
          >
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="flex-shrink-0 flex-grow-0 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 cursor-pointer"
                style={{ 
                  opacity: inView ? 1 : 0,
                  transform: `translateY(${inView ? '0' : '40px'})`,
                  transition: 'all 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: `${index * 300}ms`
                }}
                onClick={() => handleImageClick(index)}
              >
                <div className={styles.imageContainer}>
                  <Image
                    src={post.imageUrl}
                    alt={post.caption}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover rounded-lg shadow-lg"
                    priority={index < 4}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                    <p className="text-white text-sm truncate">{post.caption}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-white text-xs">@{post.username}</span>
                      <span className="text-white text-xs ml-auto">{post.likes} likes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Chevron */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-brand-light hover:bg-brand-light/90 text-brand-dark w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Fullscreen Gallery */}
      {selectedImageIndex !== null && (
        <FullscreenGallery
          images={posts.map(post => ({ id: post.id, src: post.imageUrl, alt: post.caption }))}
          initialIndex={selectedImageIndex}
          onClose={handleCloseFullscreen}
        />
      )}
    </>
  )
}