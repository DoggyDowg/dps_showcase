import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const startTime = Date.now()
  try {
    const { listing_url, listing_text, user } = await request.json()
    console.log('Received request:', { listing_url, listing_text, user })

    if (!listing_url) {
      return NextResponse.json(
        { error: 'listing_url is required' },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'user identifier is required' },
        { status: 400 }
      )
    }

    const difyApiKey = process.env.NEXT_PUBLIC_DIFY_PROPCOPY_API_KEY
    console.log('Using Dify API key:', difyApiKey?.substring(0, 8) + '...')

    if (!difyApiKey) {
      return NextResponse.json(
        { error: 'Dify API key not configured' },
        { status: 500 }
      )
    }

    console.log('Making request to Dify API...')
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout
    
    try {
      // Call Dify API with timeout
      const response = await fetch('https://api.dify.ai/v1/workflows/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${difyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {
            listing_url,
            ...(listing_text && { listing_text }),
          },
          response_mode: 'blocking',
          user
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      const endTime = Date.now()
      console.log(`Dify API request completed in ${endTime - startTime}ms`)
      console.log('Dify API response status:', response.status)
      
      const responseText = await response.text()
      console.log('Dify API response:', responseText)

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to scrape property content: ${responseText}` },
          { status: response.status }
        )
      }

      // Parse the response data into a structured format
      try {
        const data = JSON.parse(responseText)
        // Check if the response is already in JSON format
        if (data.data?.outputs?.text) {
          try {
            // Try to parse the text field if it's a JSON string
            const content = JSON.parse(data.data.outputs.text)
            return NextResponse.json(content)
          } catch {
            // If parsing fails, return the text as is
            return NextResponse.json(data.data.outputs)
          }
        } else {
          // If the response doesn't match expected format, return the raw data
          return NextResponse.json(data)
        }
      } catch (error) {
        console.error('Error parsing Dify response:', error)
        return NextResponse.json(
          { error: 'Failed to parse property content: ' + (error instanceof Error ? error.message : String(error)) },
          { status: 500 }
        )
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timed out after 60 seconds')
        return NextResponse.json(
          { error: 'Request timed out after 60 seconds' },
          { status: 524 }
        )
      }
      throw error // Re-throw other errors to be caught by outer try-catch
    }
  } catch (error) {
    const endTime = Date.now()
    console.error(`Error in scrape-property API after ${endTime - startTime}ms:`, error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}