'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useYourHomeImage(propertyId?: string, isDemoProperty?: boolean) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    async function loadImage() {
      if (!propertyId) {
        console.log('No propertyId provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // If it's a demo property, use the demo image
        if (isDemoProperty) {
          console.log('Loading demo home image')
          const supportedFormats = ['webp', 'jpg'] // Reduced to most efficient formats
          let foundImage = false
          
          for (const format of supportedFormats) {
            const { data: publicUrlData } = supabase
              .storage
              .from('property-assets')
              .getPublicUrl(`demo/your_home/image.${format}`)

            // Verify if the image exists
            try {
              const response = await fetch(publicUrlData.publicUrl, { 
                method: 'HEAD',
                signal: abortController.signal
              })
              if (response.ok) {
                console.log(`Found demo home image in ${format} format`)
                if (isMounted) {
                  setImageUrl(publicUrlData.publicUrl)
                }
                foundImage = true
                break
              }
            } catch (err) {
              console.log(`No ${format} format found for demo home image:`, err)
            }
          }

          if (!foundImage) {
            console.error('No supported image format found for demo home image')
            if (isMounted) {
              setImageUrl(null)
            }
          }
          if (isMounted) {
            setLoading(false)
          }
          return
        }

        // Otherwise, query the assets table for a real property
        console.log('Fetching home image for property:', propertyId)
        const { data, error } = await supabase
          .from('assets')
          .select('storage_path')
          .eq('property_id', propertyId)
          .eq('category', 'yourhome')
          .eq('status', 'active')
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No home image found for property')
            if (isMounted) {
              setImageUrl(null)
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
            setImageUrl(publicUrlData.publicUrl)
          }
        } else {
          if (isMounted) {
            setImageUrl(null)
          }
        }
      } catch (err) {
        console.error('Error loading home image:', err)
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load home image'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [supabase, propertyId, isDemoProperty])

  return { imageUrl, loading, error }
} 