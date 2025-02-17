'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

export function useFeaturesBanner(propertyId?: string, isDemoProperty?: boolean) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const controller = new AbortController()

    async function loadBanner() {
      if (!propertyId) {
        console.log('No propertyId provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // For real properties, query the assets table first
        if (!isDemoProperty) {
          console.log('Fetching features banner for property:', propertyId, 'attempt:', retryCount + 1)
          const { data, error } = await supabase
            .from('assets')
            .select('storage_path, type')
            .eq('property_id', propertyId)
            .eq('category', 'features_banner')
            .eq('status', 'active')
            .single()

          if (error) {
            if (error.code === 'PGRST116') {
              console.log('No features banner found for property')
              if (isMounted) {
                setImageUrl(null)
                setLoading(false)
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

            // Verify the image exists and is accessible
            try {
              const response = await fetch(publicUrlData.publicUrl, { 
                method: 'HEAD',
                signal: controller.signal
              })
              
              if (response.ok) {
                console.log('Successfully loaded features banner')
                if (isMounted) {
                  setImageUrl(publicUrlData.publicUrl)
                  setLoading(false)
                }
                return
              }
            } catch (err) {
              console.error('Error verifying banner accessibility:', err)
              throw err
            }
          }
        }

        // If we're here, either it's a demo property or the live property's image failed to load
        if (isDemoProperty) {
          console.log('Loading demo features banner, attempt:', retryCount + 1)
          // Prioritize WebP for better performance
          const { data: publicUrlData } = supabase
            .storage
            .from('property-assets')
            .getPublicUrl('demo/features_banner/banner.webp')

          try {
            const response = await fetch(publicUrlData.publicUrl, { 
              method: 'HEAD',
              signal: controller.signal
            })
            
            if (response.ok) {
              console.log('Successfully loaded demo features banner')
              if (isMounted) {
                setImageUrl(publicUrlData.publicUrl)
                setLoading(false)
              }
              return
            }
          } catch (err) {
            console.log('Error checking WebP banner:', err)
            // Fall back to JPG if WebP fails
            const jpgData = supabase
              .storage
              .from('property-assets')
              .getPublicUrl('demo/features_banner/banner.jpg')

            if (isMounted) {
              setImageUrl(jpgData.data.publicUrl)
              setLoading(false)
            }
            return
          }
        }

        // If we reach here, all attempts to load the image have failed
        throw new Error('Failed to load features banner')
      } catch (err) {
        console.error('Error loading features banner:', err)
        
        // Implement retry logic
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY}ms... (${retryCount + 1}/${MAX_RETRIES})`)
          retryCount++
          setTimeout(loadBanner, RETRY_DELAY)
        } else {
          if (isMounted) {
            setError(err instanceof Error ? err : new Error('Failed to load features banner'))
            setLoading(false)
          }
        }
      }
    }

    loadBanner()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [supabase, propertyId, isDemoProperty])

  return { imageUrl, loading, error }
} 