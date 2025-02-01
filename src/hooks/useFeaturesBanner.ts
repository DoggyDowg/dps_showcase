'use client'

import { useState, useEffect } from 'react'
import { getAssetUrl } from '@/utils/getAssetUrl'

export function useFeaturesBanner(propertyId: string, isDemo?: boolean) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo) {
      // For demo properties, use the demo features banner
      const demoUrl = getAssetUrl({
        propertyId,
        isDemo: true,
        category: 'features_banner',
        filename: 'features.jpg'
      })
      setImageUrl(demoUrl)
      setLoading(false)
    } else {
      // For live properties, fetch from the property's assets
      fetch(`/api/properties/${propertyId}/assets?category=features_banner`)
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            setImageUrl(getAssetUrl({
              propertyId,
              isDemo: false,
              category: 'features_banner',
              filename: data[0].filename
            }))
          }
          setLoading(false)
        })
        .catch(error => {
          console.error('Error fetching features banner:', error)
          setImageUrl(null)
          setLoading(false)
        })
    }
  }, [propertyId, isDemo])

  return { imageUrl, loading }
} 