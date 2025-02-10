import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface GalleryImage {
  id: string
  src: string
  alt: string
}

export async function getGalleryImages(propertyId: string): Promise<GalleryImage[]> {
  try {
    const { data: images, error } = await supabase
      .from('property_gallery_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('rank', { ascending: true })

    if (error) {
      console.error('Error fetching gallery images:', error)
      return []
    }

    return images.map(img => ({
      id: img.id,
      src: img.image_url,
      alt: img.alt_text || 'Property gallery image'
    }))
  } catch (error) {
    console.error('Error in getGalleryImages:', error)
    return []
  }
} 