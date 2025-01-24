'use client'

import { useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'
import { FullscreenGallery } from './FullscreenGallery'
import styles from '@/styles/TransitionGallery.module.css'

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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Chevron */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Gallery */}
          <div
            ref={scrollContainerRef}
            className={`flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory ${styles.gallery} ${inView ? styles.visible : ''}`}
          >
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="flex-shrink-0 w-72 h-72 relative snap-start cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={post.imageUrl}
                  alt={post.caption}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedImageIndex !== null && (
        <FullscreenGallery
          images={posts.map(post => ({
            src: post.imageUrl,
            alt: post.caption
          }))}
          initialIndex={selectedImageIndex}
          onClose={handleCloseFullscreen}
        />
      )}
    </>
  )
}