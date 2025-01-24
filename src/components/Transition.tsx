'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import type { Property } from '@/types/property'

interface TransitionProps {
  property: Property
}

export function Transition({ property }: TransitionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

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
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={sectionRef}
      className="relative h-[50vh] overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/sections/transition/transition.jpg"
          alt="Luxury Property Transition"
          fill
          className={`object-cover transition-transform duration-1000 ${
            isVisible ? 'scale-105' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-brand-dark/30" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center px-6">
        <div 
          className={`max-w-4xl transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-light text-brand-light mb-4">
            {property.content.transition_headline || "Experience Luxury Living"}
          </h2>
          <p className="text-xl md:text-2xl font-light text-brand-light/90">
            {property.content.transition_text || "Where elegance meets comfort, and every detail tells a story of sophistication."}
          </p>
        </div>
      </div>
    </section>
  )
} 