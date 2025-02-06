'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useMoreInfoVideo(propertyId?: string, isDemoProperty?: boolean) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    async function loadVideo() {
      if (!propertyId) {
        console.log('No propertyId provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // If it's a demo property, use the demo video
        if (isDemoProperty) {
          console.log('Loading demo video')
          const supportedFormats = ['mp4', 'webm'] // Common video formats
          let foundVideo = false
          
          for (const format of supportedFormats) {
            const { data: publicUrlData } = supabase
              .storage
              .from('property-assets')
              .getPublicUrl(`demo/hero_video/hero.${format}`)

            // Verify if the video exists
            try {
              const response = await fetch(publicUrlData.publicUrl, { 
                method: 'HEAD',
                signal: abortController.signal
              })
              if (response.ok) {
                console.log(`Found demo video in ${format} format`)
                if (isMounted) {
                  setVideoUrl(publicUrlData.publicUrl)
                }
                foundVideo = true
                break
              }
            } catch (err) {
              console.log(`No ${format} format found for demo video:`, err)
            }
          }

          if (!foundVideo) {
            console.error('No supported video format found for demo video')
            if (isMounted) {
              setVideoUrl(null)
            }
          }
          if (isMounted) {
            setLoading(false)
          }
          return
        }

        // Otherwise, query the assets table for a real property
        console.log('Fetching video for property:', propertyId)
        const { data, error } = await supabase
          .from('assets')
          .select('storage_path')
          .eq('property_id', propertyId)
          .eq('category', 'hero_video')
          .eq('status', 'active')
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No video found for property')
            if (isMounted) {
              setVideoUrl(null)
            }
            return
          }
          throw error
        }

        if (data?.storage_path) {
          const { data: publicUrlData } = supabase
            .storage
            .from('property-assets')
            .getPublicUrl(data.storage_path)

          if (isMounted) {
            setVideoUrl(publicUrlData.publicUrl)
          }
        } else {
          if (isMounted) {
            setVideoUrl(null)
          }
        }
      } catch (err) {
        console.error('Error loading video:', err)
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load video'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadVideo()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [supabase, propertyId, isDemoProperty])

  return { videoUrl, loading, error }
} 