import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const pathname = request.nextUrl.pathname
  const url = request.url

  // Log basic request information
  console.log(JSON.stringify({
    message: '🔍 TEST MIDDLEWARE TRIGGERED',
    timestamp: new Date().toISOString(),
    hostname,
    pathname,
    url
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

  // Test rewrite for www.1mackiegve.com
  if (hostname === 'www.1mackiegve.com' || hostname === '1mackiegve.com') {
    const newUrl = request.nextUrl.clone()
    newUrl.pathname = '/properties/918bd332-c7a9-4541-ba06-68e4829206e4'
    
    console.log(JSON.stringify({
      message: '↪️ REWRITING URL',
      from: pathname,
      to: newUrl.pathname,
      hostname
    }))
    
    return NextResponse.rewrite(newUrl)
  }

  return NextResponse.next()
}

// Match all routes for testing
export const config = {
  matcher: ['/:path*']
} 