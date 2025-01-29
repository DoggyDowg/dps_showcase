import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const startTime = Date.now()
  const headersList = await headers()
  const origin = headersList.get('origin') || '*'

  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  }

  try {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers: corsHeaders })
    }

    const { listing_url, listing_text, user } = await request.json()
    console.log('Received request:', { listing_url, listing_text, user })

    if (!listing_url) {
      return NextResponse.json(
        { error: 'listing_url is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'user identifier is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    const difyApiKey = process.env.NEXT_PUBLIC_DIFY_PROPCOPY_API_KEY
    console.log('Using Dify API key:', difyApiKey?.substring(0, 8) + '...')

    if (!difyApiKey) {
      return NextResponse.json(
        { error: 'Dify API key not configured' },
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('Making request to Dify API...')
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25 second timeout for Vercel
    
    try {
      // Call Dify API with timeout and streaming enabled
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
          response_mode: 'streaming', // Change to streaming mode
          user
        }),
        signal: controller.signal,
        keepalive: true
      })

      clearTimeout(timeoutId)
      
      const endTime = Date.now()
      console.log(`Dify API request completed in ${endTime - startTime}ms`)
      console.log('Dify API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Dify API error response:', errorText)
        return NextResponse.json(
          { error: `Dify API error: ${response.status} - ${errorText}` },
          { status: response.status, headers: corsHeaders }
        )
      }

      if (!response.body) {
        console.error('No response body received from Dify API')
        return NextResponse.json(
          { error: 'No response body received from Dify API' },
          { status: 502, headers: corsHeaders }
        )
      }

      // Handle streaming response
      const reader = response.body.getReader()
      let result = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += new TextDecoder().decode(value)
      }

      console.log('Dify API response:', result)

      try {
        const data = JSON.parse(result)
        if (data.data?.outputs?.text) {
          try {
            const content = JSON.parse(data.data.outputs.text)
            return NextResponse.json(content, { headers: corsHeaders })
          } catch {
            return NextResponse.json(data.data.outputs, { headers: corsHeaders })
          }
        } else {
          return NextResponse.json(data, { headers: corsHeaders })
        }
      } catch (error) {
        console.error('Error parsing Dify response:', error)
        return NextResponse.json(
          { error: 'Failed to parse property content: ' + (error instanceof Error ? error.message : String(error)) },
          { status: 500, headers: corsHeaders }
        )
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timed out after 25 seconds')
        return NextResponse.json(
          { error: 'Request timed out after 25 seconds' },
          { status: 524, headers: corsHeaders }
        )
      }
      throw error
    }
  } catch (error) {
    const endTime = Date.now()
    console.error(`Error in scrape-property API after ${endTime - startTime}ms:`, error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500, headers: corsHeaders }
    )
  }
}