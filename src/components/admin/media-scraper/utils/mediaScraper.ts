import { MediaAsset } from '../MediaScraperModal'

export async function scrapeMediaFromUrl(url: string): Promise<MediaAsset[]> {
  try {
    console.log('Scraping URL:', url)
    
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })

    console.log('API Response status:', response.status)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('API Error:', error)
      throw new Error(error.message || 'Failed to scrape media')
    }

    const data = await response.json()
    console.log('API Response data:', data)

    // Filter out unwanted assets
    const filteredAssets = data.assets.filter((asset: MediaAsset) => {
      // Filter out tracking pixels, analytics URLs, and data URLs
      if (asset.url.includes('tracker') || 
          asset.url.includes('analytics') || 
          asset.url.includes('pixel') ||
          asset.url.includes('data:') ||
          asset.url.includes('tracking') ||
          asset.url.includes('beacon')) {
        return false
      }

      // Keep videos and floor plans regardless of size
      if (asset.type === 'video' || asset.category === 'floorplan') {
        return true
      }

      // Filter out small images that are likely icons or UI elements
      if (asset.type === 'image') {
        const url = new URL(asset.url)
        const path = url.pathname.toLowerCase()
        
        // Skip common UI image patterns
        if (path.includes('icon') ||
            path.includes('logo') ||
            path.includes('button') ||
            path.includes('social') ||
            path.includes('avatar')) {
          return false
        }
      }

      return true
    })
    
    // Process each asset
    const processedAssets = filteredAssets.map((asset: MediaAsset, index: number) => {
      // For videos
      if (asset.url.includes('youtube.com') || 
          asset.url.includes('youtu.be') || 
          asset.url.includes('vimeo.com') ||
          asset.url.match(/\.(mp4|webm|ogg)$/i)) {
        return {
          ...asset,
          type: 'video',
          category: 'hero_video'
        }
      }

      // For floor plans
      if (asset.url.toLowerCase().includes('floor') || 
          asset.url.toLowerCase().includes('plan')) {
        return {
          ...asset,
          type: 'image',
          category: 'floorplan'
        }
      }

      // For footer images
      if (asset.url.toLowerCase().includes('footer') || 
          asset.url.toLowerCase().includes('bottom')) {
        return {
          ...asset,
          type: 'image',
          category: 'footer'
        }
      }

      // For regular images, suggest initial categories based on position
      // First few large images are likely gallery candidates
      if (index < 16) {
        return {
          ...asset,
          type: 'image',
          category: 'gallery'
        }
      }

      // Default uncategorized
      return {
        ...asset,
        type: 'image',
        category: 'uncategorized'
      }
    })

    console.log('Processed assets:', processedAssets)
    return processedAssets
    
  } catch (error) {
    console.error('Error scraping media:', error)
    throw error
  }
} 