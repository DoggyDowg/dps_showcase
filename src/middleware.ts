import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const pathname = request.nextUrl.pathname
  const url = request.url

  console.log('🚨 TESTING MIDDLEWARE:', { 
    hostname, 
    pathname, 
    url,
    time: new Date().toISOString()
  })

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 