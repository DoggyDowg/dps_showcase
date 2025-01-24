'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useHeroVideo(propertyId?: string) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadVideo() {
      if (!propertyId) {
        console.log('No propertyId provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log('Fetching hero video for property:', propertyId)

        const { data, error } = await supabase
          .from('assets')
          .select('storage_path')
          .eq('property_id', propertyId)
          .eq('category', 'hero_video')
          .eq('status', 'active')
          .single()

        if (error) {
          // If no video found, this is not an error condition
          if (error.code === 'PGRST116') {
            console.log('No hero video found for property')
            setVideoUrl(null)
            return
          }
          throw error
        }

        console.log('Asset data:', data)

        if (data?.storage_path) {
          // Get the public URL for the asset
          const { data: publicUrlData } = supabase
            .storage
            .from('property-assets')
            .getPublicUrl(data.storage_path)

          console.log('Public URL:', publicUrlData)
          setVideoUrl(publicUrlData.publicUrl)
        } else {
          console.log('No hero video found for property')
          setVideoUrl(null)
        }
      } catch (err) {
        console.error('Error loading hero video:', err)
        setError(err instanceof Error ? err : new Error('Failed to load hero video'))
      } finally {
        setLoading(false)
      }
    }

    loadVideo()
  }, [supabase, propertyId])

  return { videoUrl, loading, error }
} 