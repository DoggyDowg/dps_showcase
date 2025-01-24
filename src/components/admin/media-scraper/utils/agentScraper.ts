import type { AgentAssets } from '@/types/agent'

export async function scrapeAgentFromUrl(url: string): Promise<AgentAssets> {
  try {
    console.log('Scraping agent assets from URL:', url)
    
    const response = await fetch('/api/scrape-agent', {
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
      throw new Error(errorData.error || 'Failed to scrape agent assets')
    }

    const data = await response.json()
    console.log('API Response data:', data)

    if (!data || typeof data !== 'object') {
      console.error('Invalid API response format:', data)
      throw new Error('Invalid response format from server')
    }

    // Ensure we have the expected arrays and objects
    const images = Array.isArray(data.images) ? data.images : []
    const agentDetails = data.agentDetails || {}

    console.log('Processed agent assets:', { images, agentDetails })

    return {
      images,
      agentDetails
    }
    
  } catch (error) {
    console.error('Error scraping agent assets:', error)
    throw error
  }
}