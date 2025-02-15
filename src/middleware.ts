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
  const url = request.url

  console.log('🔍 Middleware called:', { hostname, pathname, url })

  // Skip middleware for specific paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon') ||
    pathname.startsWith('/public')
  ) {
    console.log('⏭️ Skipping middleware for system path:', pathname)
    return NextResponse.next()
  }

  try {
    console.log('🔎 Querying Supabase for domain:', hostname)
    
    // Query Supabase for property with matching custom domain
    const { data: property, error } = await supabase
      .from('properties')
      .select('id, name')
      .eq('custom_domain', hostname)
      .single()

    if (error) {
      console.error('❌ Supabase query error:', error)
      throw error
    }

    if (property) {
      console.log('✅ Found property:', property)
      
      // Only rewrite the root path and non-system paths
      if (pathname === '/' || !pathname.startsWith('/_')) {
        const url = request.nextUrl.clone()
        url.pathname = `/properties/${property.id}`
        console.log('↪️ Rewriting to:', url.pathname)
        return NextResponse.rewrite(url)
      }
    } else {
      console.log('❌ No property found for domain:', hostname)
    }
  } catch (error) {
    console.error('💥 Error in middleware:', error)
  }

  console.log('➡️ Continuing with original request:', pathname)
  return NextResponse.next()
}

// Update matcher to be more permissive
export const config = {
  matcher: [
    // Match all paths
    '/:path*',
  ],
} 