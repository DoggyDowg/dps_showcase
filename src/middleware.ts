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

  // For testing, let's add a custom header to verify middleware execution
  const response = NextResponse.next()
  response.headers.set('x-middleware-test', 'true')
  
  return response
}

// Match all routes for testing
export const config = {
  matcher: ['/:path*']
} 