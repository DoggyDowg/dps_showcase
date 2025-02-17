'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ParallaxBanner } from './shared/ParallaxBanner'
import { HomeGallery } from './HomeGallery'
import { useFeaturesBanner } from '@/hooks/useFeaturesBanner'
import { useYourHomeImage } from '@/hooks/useYourHomeImage'
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
  const { content } = property
  const featuresData = content.features || { items: [], header: '', headline: '', description: '' }

  // Debug log for virtual tour
  useEffect(() => {
    console.log('YourHome render - property:', {
      id: property.id,
      is_demo: property.is_demo
    });
  }, [property]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsFeaturesVisible(true)
            observer.disconnect()
          }
        })
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (featuresRef.current) {
      observer.observe(featuresRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className="flex flex-col">
      <div id="features">
        <ParallaxBanner
          imageSrc={bannerUrl || '/images/banners/yourhome.jpg'}
          title={featuresData.banner_title || "YOUR HOME"}
          loading={bannerLoading}
        />
      </div>

      {/* Content Section */}
      <section className="pt-20 pb-20 px-6 sm:px-8 lg:px-12 bg-brand-light">
        <div className="max-w-7xl mx-auto">
          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div 
              className="prose prose-lg max-w-none text-brand-dark prose-ul:text-brand-dark prose-li:marker:text-brand-dark transition-all duration-1000"
              style={{ 
                opacity: isVisible ? 1 : 0,
                transform: `translateY(${isVisible ? '0' : '40px'})`
              }}
            >
              <h3 className="text-3xl font-light mb-6 text-brand-dark">{featuresData.headline}</h3>
              <p className="text-brand-dark">{featuresData.description || featuresData.header}</p>
            </div>

            {/* Right Column - Image */}
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
                />
              ) : (
                <Image
                  src="/images/sections/yourhome/yourhome.jpg"
                  alt="Your Home Feature"
                  fill
                  className="object-cover rounded-lg shadow-xl"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="relative bg-brand-dark isolate">
        {/* Background Image (Blurred) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-xl -z-10"
          style={{ 
            backgroundImage: `url(${homeImageUrl || '/images/sections/yourhome/yourhome.jpg'})`,
            opacity: 0.5,
            transform: 'scale(1.1)'
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-brand-dark/70 -z-10" />

        {/* Content */}
        <div className="relative px-12 py-16">
          {/* Features Grid */}
          <div ref={featuresRef} className="max-w-7xl mx-auto mb-8">
            <h4 className="text-2xl font-light mb-4 text-brand-light text-center">Home Highlights</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {featuresData.items?.filter(item => item.feature?.trim()).map((feature, index) => (
                <div 
                  key={index}
                  className="[background-color:rgb(var(--brand-light)/0.1)] [border-color:rgb(var(--brand-light)/0.2)] backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-brand-light text-center font-light border inline-block text-sm transition-all duration-800"
                  style={{ 
                    opacity: isFeaturesVisible ? 1 : 0,
                    transform: `translateY(${isFeaturesVisible ? '0' : '20px'})`,
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {feature.feature}
                </div>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div className="max-w-7xl mx-auto">
            <HomeGallery property={property} />
          </div>
        </div>
      </section>

      {/* Virtual Tour Section */}
      <section id="virtual-tour" className="bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <VirtualTourSection property={property} />
        </div>
      </section>
    </div>
  )
} 