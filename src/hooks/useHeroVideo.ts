'use client'

import { useState, useEffect } from 'react'
import { getAssetUrl } from '@/utils/getAssetUrl'

export function useHeroVideo(propertyId: string, isDemo?: boolean) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isDemo) {
      // For demo properties, use the demo hero video
      const demoUrl = getAssetUrl({
        propertyId,
        isDemo: true,
        category: 'hero_video',
        filename: 'hero.mp4'
      })
      setVideoUrl(demoUrl)
    } else {
      // For live properties, fetch from the property's assets
      fetch(`/api/properties/${propertyId}/assets?category=hero_video`)
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            setVideoUrl(getAssetUrl({
              propertyId,
              isDemo: false,
              category: 'hero_video',
              filename: data[0].filename
            }))
          }
        })
        .catch(error => {
          console.error('Error fetching hero video:', error)
          setVideoUrl(null)
        })
    }
  }, [propertyId, isDemo])

  return { videoUrl }
}