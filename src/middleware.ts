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

  try {
    // Query Supabase for property with matching custom domain
    const { data: property } = await supabase
      .from('properties')
      .select('id')
      .eq('custom_domain', hostname)
      .single()

    if (property) {
      // If on root path and property found, redirect to property page
      if (request.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL(`/properties/${property.id}`, request.url))
      }
    }
  } catch (error) {
    console.error('Error in middleware:', error)
  }

  // Continue with the request if no redirect needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 