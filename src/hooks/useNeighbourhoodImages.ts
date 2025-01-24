'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Asset } from '@/types/assets'

export interface NeighbourhoodImage {
  src: string
  alt: string
  id: string
}

export function useNeighbourhoodImages(propertyId?: string) {
  const [images, setImages] = useState<NeighbourhoodImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadImages() {
      if (!propertyId) {
        console.log('No propertyId provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log('Fetching neighbourhood images for property:', propertyId)

        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .eq('property_id', propertyId)
          .eq('category', 'neighbourhood')
          .order('filename', { ascending: true })

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        console.log('Asset data:', data)

        if (data && data.length > 0) {
          const neighbourhoodImages = await Promise.all(data.map(async (asset: Asset) => {
            console.log('Processing asset:', asset)
            const { data: publicUrlData } = supabase
              .storage
              .from('property-assets')
              .getPublicUrl(asset.storage_path)

            console.log('Public URL data:', publicUrlData)
            return {
              src: publicUrlData.publicUrl,
              alt: asset.title || asset.filename,
              id: asset.id
            }
          }))

          console.log('Processed neighbourhood images:', neighbourhoodImages)
          setImages(neighbourhoodImages)
        } else {
          console.log('No neighbourhood images found')
          setImages([])
        }
      } catch (err) {
        console.error('Detailed error:', err)
        setError(err instanceof Error ? err : new Error('Failed to load neighbourhood images'))
      } finally {
        setLoading(false)
      }
    }

    loadImages()
  }, [supabase, propertyId])

  return { images, loading, error }
} 