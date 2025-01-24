import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function useMoreInfoVideo(propertyId?: string) {
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

        // First try to get more_info_video
        console.log('Fetching more info video for property:', propertyId)
        const { data: moreInfoVideo, error: moreInfoError } = await supabase
          .from('assets')
          .select('storage_path')
          .eq('property_id', propertyId)
          .eq('category', 'more_info_video')
          .eq('status', 'active')
          .single()

        // If we found a more_info_video, use that
        if (!moreInfoError && moreInfoVideo?.storage_path) {
          const { data: publicUrlData } = supabase
            .storage
            .from('property-assets')
            .getPublicUrl(moreInfoVideo.storage_path)

          console.log('More info video public URL:', publicUrlData)
          setVideoUrl(publicUrlData.publicUrl)
          return
        }

        // If no more_info_video found (or error), try hero_video
        if (moreInfoError?.code === 'PGRST116' || !moreInfoVideo) {
          console.log('No more info video found, trying hero video')
          const { data: heroVideo, error: heroError } = await supabase
            .from('assets')
            .select('storage_path')
            .eq('property_id', propertyId)
            .eq('category', 'hero_video')
            .eq('status', 'active')
            .single()

          if (!heroError && heroVideo?.storage_path) {
            const { data: publicUrlData } = supabase
              .storage
              .from('property-assets')
              .getPublicUrl(heroVideo.storage_path)

            console.log('Hero video public URL:', publicUrlData)
            setVideoUrl(publicUrlData.publicUrl)
            return
          }

          if (heroError?.code === 'PGRST116') {
            console.log('No hero video found either')
            setVideoUrl(null)
            return
          }

          if (heroError) throw heroError
        }

        // If we got here with a non-PGRST116 error, throw it
        if (moreInfoError?.code !== 'PGRST116') throw moreInfoError

        // If we got here with no video, set to null
        setVideoUrl(null)
      } catch (err) {
        console.error('Error loading video:', err)
        setError(err instanceof Error ? err : new Error('Failed to load video'))
        setVideoUrl(null)
      } finally {
        setLoading(false)
      }
    }

    loadVideo()
  }, [propertyId, supabase])

  return { videoUrl, loading, error }
} 