'use client'

import { useEffect, useRef, useState } from 'react'
import { useGoogleMaps } from '@/components/shared/GoogleMapsLoader'
import { getLandmarks } from '@/utils/landmarkUtils'
import { useAssetLoading } from '@/contexts/AssetLoadingContext'
import { GoogleMap } from '@/components/shared/GoogleMap'
import type { Property } from '@/types/property'
import type { Property as MapProperty, Landmark } from '@/types/maps'

interface YourNeighbourhoodProps {
  property: Property
}

export function YourNeighbourhood({ property }: YourNeighbourhoodProps) {
  const { isLoaded } = useGoogleMaps()
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [mapProperty, setMapProperty] = useState<MapProperty | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isVisibleRow1, setIsVisibleRow1] = useState(false)
  const [isVisibleRow2, setIsVisibleRow2] = useState(false)
  const [isVisibleRow3, setIsVisibleRow3] = useState(false)
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const row3Ref = useRef<HTMLDivElement>(null)
  const { registerAsset, markAssetAsLoaded } = useAssetLoading()
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Initialize when map is loaded
  useEffect(() => {
    if (isLoaded) {
      console.log('[YourNeighbourhood] Map loaded, initializing')
      setIsInitialized(true)
      registerAsset() // Register the map as an asset
    }
  }, [isLoaded, registerAsset])

  // Set up intersection observers
  useEffect(() => {
    if (!isInitialized) {
      console.log('[YourNeighbourhood] Not initialized yet, skipping observer setup')
      return
    }

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === row1Ref.current) {
              console.log('[YourNeighbourhood] Row 1 in view')
              setIsVisibleRow1(true)
            }
            if (entry.target === row2Ref.current) {
              console.log('[YourNeighbourhood] Row 2 in view')
              setIsVisibleRow2(true)
            }
            if (entry.target === row3Ref.current) {
              console.log('[YourNeighbourhood] Row 3 in view')
              setIsVisibleRow3(true)
            }
          }
        })
      },
      { 
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    // Observe elements
    if (row1Ref.current) observerRef.current.observe(row1Ref.current)
    if (row2Ref.current) observerRef.current.observe(row2Ref.current)
    if (row3Ref.current) observerRef.current.observe(row3Ref.current)

    // Cleanup
    return () => {
      console.log('[YourNeighbourhood] Cleaning up observers')
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [isInitialized])

  // Load landmarks data
  useEffect(() => {
    async function loadLandmarks() {
      try {
        console.log('[YourNeighbourhood] Loading landmarks')
        const data = await getLandmarks()
        setLandmarks(data.landmarks)
        setMapProperty({
          name: property.name,
          position: data.property.position,
          address: data.property.address,
          id: property.id,
          is_demo: property.is_demo
        })
        console.log('[YourNeighbourhood] Landmarks loaded')
        markAssetAsLoaded() // Mark the map as loaded
      } catch (err) {
        console.error('[YourNeighbourhood] Error loading landmarks:', err)
        setError('Failed to load neighbourhood data')
      }
    }

    if (isInitialized) {
      loadLandmarks()
    }
  }, [property, isInitialized, markAssetAsLoaded])

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  const { content } = property
  const neighbourhoodContent = content.neighbourhood

  return (
    <div className="bg-brand-light">
      {/* Map Section */}
      <section className="h-[600px] relative">
        {isLoaded && mapProperty ? (
          <div className="absolute inset-0">
            <GoogleMap
              center={mapProperty.position}
              zoom={15}
              property={mapProperty}
              landmarks={landmarks}
              mode="view"
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light text-brand-dark mb-6">
              {neighbourhoodContent.text || "Discover Your Neighbourhood"}
            </h2>
          </div>

          {/* Row 1 */}
          <div 
            ref={row1Ref}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24"
            style={{
              opacity: isVisibleRow1 ? 1 : 0,
              transform: `translateY(${isVisibleRow1 ? '0' : '40px'})`,
              transition: 'all 800ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div>
              <h3 className="text-3xl font-light text-brand-dark mb-4">
                {neighbourhoodContent.part1_headline || "Location & Accessibility"}
              </h3>
              <p className="text-lg text-brand-dark/80">
                {neighbourhoodContent.part1_text || "Experience the perfect blend of urban convenience and suburban tranquility."}
              </p>
            </div>
            <div className="h-[300px] bg-gray-200 rounded-lg" />
          </div>

          {/* Row 2 */}
          <div 
            ref={row2Ref}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24"
            style={{
              opacity: isVisibleRow2 ? 1 : 0,
              transform: `translateY(${isVisibleRow2 ? '0' : '40px'})`,
              transition: 'all 800ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="md:order-2">
              <h3 className="text-3xl font-light text-brand-dark mb-4">
                {neighbourhoodContent.part2_headline || "Lifestyle & Culture"}
              </h3>
              <p className="text-lg text-brand-dark/80">
                {neighbourhoodContent.part2_text || "Immerse yourself in a vibrant community with endless possibilities."}
              </p>
            </div>
            <div className="h-[300px] bg-gray-200 rounded-lg md:order-1" />
          </div>

          {/* Row 3 */}
          <div 
            ref={row3Ref}
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
            style={{
              opacity: isVisibleRow3 ? 1 : 0,
              transform: `translateY(${isVisibleRow3 ? '0' : '40px'})`,
              transition: 'all 800ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div>
              <h3 className="text-3xl font-light text-brand-dark mb-4">
                {neighbourhoodContent.part3_headline || "Local Amenities"}
              </h3>
              <p className="text-lg text-brand-dark/80">
                {neighbourhoodContent.part3_text || "Everything you need is just moments away."}
              </p>
            </div>
            <div className="h-[300px] bg-gray-200 rounded-lg" />
          </div>
        </div>
      </section>
    </div>
  )
}
