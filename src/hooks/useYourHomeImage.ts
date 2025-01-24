'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useYourHomeImage(propertyId?: string) {
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
        console.log('Fetching your home image for property:', propertyId)

        const { data, error } = await supabase
          .from('assets')
          .select('storage_path')
          .eq('property_id', propertyId)
          .eq('category', 'your_home')
          .single()

        if (error) {
          console.error('Supabase error:', error)
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
          setImageUrl(publicUrlData.publicUrl)
        } else {
          console.log('No your home image found for property')
        }
      } catch (err) {
        console.error('Detailed error:', err)
        setError(err instanceof Error ? err : new Error('Failed to load your home image'))
      } finally {
        setLoading(false)
      }
    }

    loadImage()
  }, [supabase, propertyId])

  return { imageUrl, loading, error }
} 