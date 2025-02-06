'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useHeroVideo } from '@/hooks/useHeroVideo'
import styles from '@/styles/Hero.module.css'
import type { Property } from '@/types/property'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface HeroProps {
  property: Property
}

export function Hero({ property }: HeroProps) {
  const { videoUrl } = useHeroVideo(property.id)
  
  // Refs for GSAP animations
  const addressRef = useRef<HTMLHeadingElement>(null)
  const suburbRef = useRef<HTMLHeadingElement>(null)
  const ctaContainerRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadlineRef = useRef<HTMLParagraphElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const topSectionRef = useRef<HTMLDivElement>(null)

  // Set up GSAP animations
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    const videoElement = document.querySelector('video')

    // Set up immediate scroll animation
    if (topSectionRef.current) {
      gsap.to(topSectionRef.current, {
        y: '-50%',
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: '+=50%',
          scrub: 0.5,
          immediateRender: true,
          onUpdate: (self) => {
            const progress = self.progress
            const blurAmount = Math.pow(progress * 20, 2)
            gsap.set(topSectionRef.current, {
              filter: `blur(${blurAmount}px)`
            })
          }
        }
      })
    }

    // Function to start initial animations
    const startAnimations = () => {
      // Initial state - set elements to be blurred and slightly translated
      gsap.set([logoRef.current, addressRef.current, suburbRef.current, ctaContainerRef.current, headlineRef.current, subheadlineRef.current], {
        opacity: 0,
        y: 30,
        filter: 'blur(10px)'
      })

      // Video reveal animation
      gsap.set(".video-overlay", {
        backgroundColor: '#111111',
        opacity: 1
      })

      gsap.to(".video-overlay", {
        opacity: 0,
        duration: 3,
        delay: 4,
        ease: "power2.inOut",
      })

      // Text animations
      tl.to(logoRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        delay: 4
      })
      .to(addressRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2
      }, '-=0.8')
      .to(suburbRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2
      }, '-=0.8')
      .to(ctaContainerRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2
      }, '-=0.8')
      .to(headlineRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2
      }, '-=0.8')
      .to(subheadlineRef.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2
      }, '-=0.8')
    }

    // Start animations when video is loaded
    if (videoElement) {
      if (videoElement.readyState >= 3) {
        startAnimations()
      } else {
        videoElement.addEventListener('loadeddata', startAnimations)
      }
    } else {
      startAnimations()
    }

    // Cleanup
    return () => {
      videoElement?.removeEventListener('loadeddata', startAnimations)
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section className="relative min-h-screen w-full overflow-x-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        {videoUrl ? (
          <>
            <video
              className="absolute h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
            {/* Single overlay that animates from black to semi-transparent */}
            <div className="video-overlay absolute inset-0 bg-brand-dark transition-opacity duration-1000" style={{ opacity: 1 }} ref={el => {
              if (el && !el.dataset.initialized) {
                const videoElement = document.querySelector('video')
                const startAnimation = () => {
                  gsap.to(el, {
                    opacity: 0.3,
                    duration: 1,
                    delay: 1,
                    ease: "power2.inOut",
                  })
                }

                if (videoElement) {
                  if (videoElement.readyState >= 3) {
                    startAnimation()
                  } else {
                    videoElement.addEventListener('loadeddata', startAnimation)
                  }
                }
                el.dataset.initialized = 'true'
              }
            }} />
          </>
        ) : (
          <div className="absolute inset-0 bg-brand-dark" />
        )}
      </div>

      {/* Content */}
      <div className="relative flex flex-col text-brand-light text-center px-4 sm:px-6 lg:px-12 pt-10 md:pt-12 z-20 min-h-screen">
        {/* Initial Navigation */}
        <div className="hidden md:block pt-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative flex items-center justify-between">
              {/* Left Navigation Group */}
              <div className="flex items-center gap-8 lg:gap-12">
                <a href="#features" className="text-brand-light hover:text-brand-light/80 transition-colors font-light text-sm sm:text-[15px] xl:text-base">Features</a>
                <a href="#lifestyle" className="text-brand-light hover:text-brand-light/80 transition-colors font-light text-sm sm:text-[15px] xl:text-base">Lifestyle</a>
                <a href="#neighbourhood" className="text-brand-light hover:text-brand-light/80 transition-colors font-light text-sm sm:text-[15px] xl:text-base">Neighbourhood</a>
              </div>

              {/* Right Navigation Group */}
              <div className="flex items-center gap-8 lg:gap-12">
                <a href="#info" className="text-brand-light hover:text-brand-light/80 transition-colors font-light text-sm sm:text-[15px] xl:text-base">Info</a>
                <a href="#viewings" className="text-brand-light hover:text-brand-light/80 transition-colors font-light text-sm sm:text-[15px] xl:text-base">Viewings</a>
                <a href="#contact" className="text-brand-light hover:text-brand-light/80 transition-colors font-light text-sm sm:text-[15px] xl:text-base">Make an Enquiry</a>
              </div>
            </div>
          </div>
        </div>

        {/* Top Section - Logo and Address */}
        <div ref={topSectionRef} className="mt-12 will-change-transform">
          {/* Agency Logo */}
          <div ref={logoRef} className="hidden md:flex justify-center mb-4">
            {property.agency_settings?.branding?.logo?.light && (
              <Image
                src={property.agency_settings.branding.logo.light}
                alt={property.agency_name || 'Agency Logo'}
                width={200}
                height={50}
                className="h-auto w-auto object-contain"
                priority
              />
            )}
          </div>

          {/* Property Address */}
          <h2 ref={addressRef} className="text-lg sm:text-xl md:text-2xl font-light mb-2 text-brand-light">{property.street_address}</h2>
          <h3 ref={suburbRef} className="text-2xl sm:text-3xl md:text-5xl font-light text-brand-light">{property.suburb}</h3>
        </div>
        
        {/* Bottom Section - CTAs and Headlines */}
        <div className="mt-auto pb-16 sm:pb-20">
          {/* CTA Buttons */}
          <div ref={ctaContainerRef} className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8">
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
          <div>
            <h1 ref={headlineRef} className="text-2xl sm:text-3xl md:text-5xl font-light mb-3 sm:mb-4 text-brand-light">
              {property.content.hero.headline}
            </h1>
            <p 
              ref={subheadlineRef} 
              className="text-lg sm:text-xl md:text-2xl font-light max-w-2xl mx-auto text-brand-light !pb-[80px]"
              style={{ paddingBottom: '80px' }}
            >
              {property.content.hero.subheadline}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}