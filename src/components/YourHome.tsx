'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ParallaxBanner } from './shared/ParallaxBanner'
import { HomeGallery } from './HomeGallery'
import { useFeaturesBanner } from '@/hooks/useFeaturesBanner'
import { useYourHomeImage } from '@/hooks/useYourHomeImage'
import { useAssetLoading } from '@/contexts/AssetLoadingContext'
import type { Property } from '@/types/property'
import dynamic from 'next/dynamic'

// Dynamically import the VirtualTourSection
const VirtualTourSection = dynamic(
  () => import('./virtual-tour/VirtualTourSection'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] animate-pulse bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-600">Loading Virtual Tour...</div>
        </div>
      </div>
    )
  }
)

interface YourHomeProps {
  property: Property
}

export function YourHome({ property }: YourHomeProps) {
  const imageRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false)
  const { imageUrl: bannerUrl, loading: bannerLoading } = useFeaturesBanner(property.id, property.is_demo)
  const { imageUrl: homeImageUrl, loading: homeImageLoading } = useYourHomeImage(property.id, property.is_demo)
  const { registerAsset, markAssetAsLoaded } = useAssetLoading()
  const { content } = property
  const featuresData = content.features || { items: [], header: '', headline: '', description: '' }
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Register assets
  useEffect(() => {
    if (!bannerLoading && bannerUrl) {
      console.log('[YourHome] Registering banner asset')
      registerAsset()
    }
    if (!homeImageLoading && homeImageUrl) {
      console.log('[YourHome] Registering home image asset')
      registerAsset()
    }
  }, [bannerLoading, bannerUrl, homeImageLoading, homeImageUrl, registerAsset])

  // Set up intersection observers
  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === imageRef.current) {
              console.log('[YourHome] Main image in view')
              setIsVisible(true)
            }
            if (entry.target === featuresRef.current) {
              console.log('[YourHome] Features section in view')
              setIsFeaturesVisible(true)
            }
          }
        })
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    // Observe elements
    if (imageRef.current) {
      observerRef.current.observe(imageRef.current)
    }
    if (featuresRef.current) {
      observerRef.current.observe(featuresRef.current)
    }

    // Cleanup
    return () => {
      console.log('[YourHome] Cleaning up observers')
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [])

  return (
    <>
      {/* Banner Section */}
      <ParallaxBanner
        imageSrc={bannerUrl || '/images/sections/features/features-banner.jpg'}
        title={featuresData.header || "Your Home"}
        loading={bannerLoading}
      />

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Text Content */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl sm:text-5xl font-light text-brand-dark mb-6">
                {featuresData.headline || "Experience Luxury Living"}
              </h2>
              <p className="text-xl text-brand-dark/80 mb-8">
                {featuresData.description || "Where every detail has been carefully considered to create an unparalleled living experience."}
              </p>
              <div 
                ref={featuresRef}
                className="grid grid-cols-1 sm:grid-cols-2 gap-8"
                style={{
                  opacity: isFeaturesVisible ? 1 : 0,
                  transform: `translateY(${isFeaturesVisible ? '0' : '40px'})`,
                  transition: 'all 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                  transitionDelay: '200ms'
                }}
              >
                {featuresData.items.map((feature, index) => (
                  <div key={index} className="flex flex-col">
                    <h3 className="text-xl font-medium text-brand-dark mb-2">{feature.feature}</h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div 
              ref={imageRef}
              className="relative h-[400px] transition-all duration-1000"
              style={{ 
                opacity: isVisible ? 1 : 0,
                transform: `translateY(${isVisible ? '0' : '40px'})`,
                transitionDelay: '300ms'
              }}
            >
              {homeImageLoading ? (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
              ) : homeImageUrl ? (
                <Image
                  src={homeImageUrl}
                  alt="Your Home Feature"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  priority
                  onLoad={() => {
                    console.log('[YourHome] Home image loaded')
                    markAssetAsLoaded()
                  }}
                />
              ) : (
                <Image
                  src="/images/sections/yourhome/yourhome.jpg"
                  alt="Your Home Feature"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                  onLoad={() => {
                    console.log('[YourHome] Fallback image loaded')
                    markAssetAsLoaded()
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <HomeGallery property={property} />

      {/* Virtual Tour Section */}
      <VirtualTourSection property={property} />
    </>
  )
} 