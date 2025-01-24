'use client'

import { useHeroVideo } from '@/hooks/useHeroVideo'
import styles from '@/styles/Hero.module.css'
import type { Property } from '@/types/property'

interface HeroProps {
  property: Property
}

export function Hero({ property }: HeroProps) {
  const { videoUrl } = useHeroVideo(property.id)

  return (
    <section className="relative h-screen w-full z-0">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        {videoUrl ? (
          <video
            className="absolute min-h-full min-w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-brand-dark" />
        )}
        <div className="absolute inset-0 bg-brand-dark/30" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col text-brand-light text-center px-4 sm:px-6 lg:px-12">
        {/* Top Section - Property Address */}
        <div className="pt-[120px] sm:pt-[160px]">
          <h2 className="text-lg sm:text-xl md:text-2xl font-light mb-2">{property.street_address}</h2>
          <h3 className="text-2xl sm:text-3xl md:text-5xl font-light">{property.suburb}</h3>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-auto pb-[60px] sm:pb-[80px]">
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
            {/* Left slide effect button */}
            <button 
              className={`${styles.slideEffect} px-8 py-3 text-brand-light bg-brand-dark active:translate-y-[3px]`}
              onClick={() => {
                const primaryBtn = property.metadata?.more_info?.ctaButtons?.primary
                if (primaryBtn?.type === 'anchor' && primaryBtn.url) {
                  document.getElementById(primaryBtn.url)?.scrollIntoView({ behavior: 'smooth' })
                } else if (primaryBtn?.url) {
                  window.open(primaryBtn.url, '_blank')
                }
              }}
            >
              {property.metadata?.more_info?.ctaButtons?.primary?.label || 'Book a Viewing'}
            </button>

            {/* Right slide effect button */}
            <button 
              className={`${styles.slideEffectReverse} px-8 py-3 text-brand-light active:translate-y-[3px]`}
              onClick={() => {
                const secondaryBtn = property.metadata?.more_info?.ctaButtons?.secondary
                if (secondaryBtn?.type === 'anchor' && secondaryBtn.url) {
                  document.getElementById(secondaryBtn.url)?.scrollIntoView({ behavior: 'smooth' })
                } else if (secondaryBtn?.url) {
                  window.open(secondaryBtn.url, '_blank')
                }
              }}
            >
              {property.metadata?.more_info?.ctaButtons?.secondary?.label || 'Download Brochure'}
            </button>
          </div>

          {/* Headline and Subheadline */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-light mb-3 sm:mb-4 px-4 sm:px-0">
            {property.content.hero.headline}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-light max-w-2xl mx-auto px-4 sm:px-0">
            {property.content.hero.subheadline}
          </p>
        </div>
      </div>
    </section>
  )
} 