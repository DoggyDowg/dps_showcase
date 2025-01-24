import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log('Proxying font from:', url)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': new URL(url).origin,
        'Referer': new URL(url).origin,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Length': response.headers.get('Content-Length') || String(blob.size),
      },
    })
  } catch (error) {
    console.error('Error proxying font:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy font' },
      { status: 500 }
    )
  }
} 