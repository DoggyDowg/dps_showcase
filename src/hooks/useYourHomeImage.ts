'use client'

import { useState, useEffect } from 'react'
import { getAssetUrl } from '@/utils/getAssetUrl'

export function useYourHomeImage(propertyId: string, isDemo?: boolean) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemo) {
      // For demo properties, use the demo your_home image
      const demoUrl = getAssetUrl({
        propertyId,
        isDemo: true,
        category: 'your_home',
        filename: 'entrance.jpg' // Using the first your_home image
      })
      setImageUrl(demoUrl)
      setLoading(false)
    } else {
      // For live properties, fetch from the property's assets
      fetch(`/api/properties/${propertyId}/assets?category=your_home`)
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            setImageUrl(getAssetUrl({
              propertyId,
              isDemo: false,
              category: 'your_home',
              filename: data[0].filename
            }))
          }
          setLoading(false)
        })
        .catch(error => {
          console.error('Error fetching your_home image:', error)
          setImageUrl(null)
          setLoading(false)
        })
    }
  }, [propertyId, isDemo])

  return { imageUrl, loading }
} 