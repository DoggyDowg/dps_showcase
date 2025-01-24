import { BrandAsset, BrandAssets } from '@/types/brand'

export async function scrapeBrandFromUrl(url: string): Promise<BrandAssets> {
  try {
    console.log('Scraping brand assets from URL:', url)
    
    const response = await fetch('/api/scrape-brand', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })

    console.log('API Response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('API Error:', errorData)
      throw new Error(errorData.error || 'Failed to scrape brand assets')
    }

    const data = await response.json()
    console.log('API Response data:', data)

    if (!data || typeof data !== 'object') {
      console.error('Invalid API response format:', data)
      throw new Error('Invalid response format from server')
    }

    // Ensure we have the expected arrays and objects
    const logos = Array.isArray(data.logos) ? data.logos : []
    const fonts = Array.isArray(data.fonts) ? data.fonts : []
    const colors = Array.isArray(data.colors) ? data.colors : []
    const agencyDetails = data.agencyDetails || {}

    console.log('Processed brand assets:', { logos, fonts, colors, agencyDetails })

    return {
      logos,
      fonts,
      colors,
      agencyDetails
    }
    
  } catch (error) {
    console.error('Error scraping brand assets:', error)
    throw error
  }
} 