import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useFooterImage(propertyId?: string) {
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
        console.log('Fetching footer image for property:', propertyId)

        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .eq('property_id', propertyId)
          .eq('category', 'footer')
          .eq('status', 'active')
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('No footer image found')
            setImageUrl(null)
            return
          }
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
          console.log('No footer image found')
          setImageUrl(null)
        }
      } catch (err) {
        console.error('Detailed error:', err)
        setError(err instanceof Error ? err : new Error('Failed to load footer image'))
      } finally {
        setLoading(false)
      }
    }

    loadImage()
  }, [supabase, propertyId])

  return { imageUrl, loading, error }
} 