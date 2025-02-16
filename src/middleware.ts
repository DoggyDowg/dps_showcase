import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams.toString()
  const fullUrl = searchParams ? `${request.url}?${searchParams}` : request.url

  // Log every request in detail
  console.log(JSON.stringify({
    message: '🔍 MIDDLEWARE REQUEST',
    timestamp: new Date().toISOString(),
    hostname,
    pathname,
    fullUrl,
    headers: Object.fromEntries(request.headers.entries())
  }))

  // Skip middleware for Next.js internals and static files
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('favicon') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')  // Skip files with extensions
  ) {
    console.log(JSON.stringify({
      message: '⏭️ SKIPPING INTERNAL PATH',
      pathname
    }))
    return NextResponse.next()
  }

  // Handle custom domain
  if (hostname === 'www.1mackiegve.com' || hostname === '1mackiegve.com') {
    const newUrl = request.nextUrl.clone()
    
    // If we're already on the properties path, skip rewriting
    if (pathname.startsWith('/properties/')) {
      console.log(JSON.stringify({
        message: '⏭️ ALREADY ON PROPERTIES PATH',
        pathname
      }))
      return NextResponse.next()
    }

    newUrl.pathname = '/properties/918bd332-c7a9-4541-ba06-68e4829206e4'
    
    // Preserve any query parameters
    if (searchParams) {
      newUrl.search = searchParams
    }
    
    console.log(JSON.stringify({
      message: '↪️ REWRITING URL',
      from: pathname,
      to: newUrl.pathname,
      hostname,
      fullFrom: fullUrl,
      fullTo: `${newUrl.origin}${newUrl.pathname}${newUrl.search}`
    }))
    
    const response = NextResponse.rewrite(newUrl)
    
    // Preserve Supabase headers
    const supabaseHeaders = [
      'x-client-info',
      'x-supabase-auth',
      'authorization',
      'apikey',
      'x-supabase-jwt'
    ]

    const preservedHeaders = supabaseHeaders.reduce((acc, header) => {
      const value = request.headers.get(header)
      if (value) {
        response.headers.set(header, value)
        acc[header] = value
      }
      return acc
    }, {} as Record<string, string>)

    console.log(JSON.stringify({
      message: '🔐 PRESERVED SUPABASE HEADERS',
      preservedHeaders
    }))
    
    // Add debug headers
    response.headers.set('x-debug-rewrite-from', pathname)
    response.headers.set('x-debug-rewrite-to', newUrl.pathname)
    response.headers.set('x-debug-hostname', hostname)
    
    return response
  }

  return NextResponse.next()
}

// Match all routes for testing
export const config = {
  matcher: ['/:path*']
} 