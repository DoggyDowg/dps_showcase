import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Fetch the file with appropriate headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    // Get the content type and filename from the response
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const contentDisposition = response.headers.get('content-disposition')
    let filename = url.split('/').pop() || 'download'
    
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="(.+?)"/)
      if (matches) {
        filename = matches[1]
      }
    }

    // Stream the response back to the client
    const blob = await response.blob()
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to download file' },
      { status: 500 }
    )
  }
} 