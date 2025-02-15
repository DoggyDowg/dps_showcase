import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const pathname = request.nextUrl.pathname

  // Skip middleware for specific paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  try {
    // Query Supabase for property with matching custom domain
    const { data: property } = await supabase
      .from('properties')
      .select('id')
      .eq('custom_domain', hostname)
      .single()

    if (property) {
      // Only rewrite the root path and non-system paths
      if (pathname === '/' || !pathname.startsWith('/_')) {
        const url = request.nextUrl.clone()
        url.pathname = `/properties/${property.id}`
        return NextResponse.rewrite(url)
      }
    }
  } catch (error) {
    console.error('Error in middleware:', error)
  }

  // Continue with the request if no rewrite needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 