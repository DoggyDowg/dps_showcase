'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useFooterImage(propertyId?: string, isDemoProperty?: boolean) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
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
          console.log('Loading demo footer image')
          
          // Try different image formats in order of preference
          const supportedFormats = ['webp', 'jpg', 'jpeg', 'png']
          let foundImage = false
          
          for (const format of supportedFormats) {
            const { data: publicUrlData } = supabase
              .storage
              .from('property-assets')
              .getPublicUrl(`demo/footer/image.${format}`)

            // Verify if the image exists by making a HEAD request
            try {
              const response = await fetch(publicUrlData.publicUrl, { method: 'HEAD' })
              if (response.ok) {
                console.log(`Found demo footer image in ${format} format`)
                setImageUrl(publicUrlData.publicUrl)
                foundImage = true
                break
              }
            } catch {
              console.log(`No ${format} format found for demo footer image`)
            }
          }

          if (!foundImage) {
            console.error('No supported image format found for demo footer')
            setImageUrl(null)
          }
          return
        }

        // Otherwise, query the assets table for a real property
        console.log('Fetching footer image for property:', propertyId)
        const { data, error } = await supabase
          .from('assets')
          .select('storage_path')
          .eq('property_id', propertyId)
          .eq('category', 'footer')
          .eq('status', 'active')
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No footer image found for property')
            setImageUrl(null)
            return
          }
          throw error
        }

        if (data?.storage_path) {
          const { data: publicUrlData } = supabase
            .storage
            .from('property-assets')
            .getPublicUrl(data.storage_path)

          setImageUrl(publicUrlData.publicUrl)
        } else {
          setImageUrl(null)
        }
      } catch (err) {
        console.error('Error loading footer image:', err)
        setError(err instanceof Error ? err : new Error('Failed to load footer image'))
      } finally {
        setLoading(false)
      }
    }

    loadImage()
  }, [supabase, propertyId, isDemoProperty])

  return { imageUrl, loading, error }
} 