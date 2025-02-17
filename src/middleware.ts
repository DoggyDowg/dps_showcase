import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  try {
    // Create Supabase client
    const supabase = createMiddlewareClient({ req: request, res: response })

    // Get the hostname (e.g., www.1mackiegve.com)
    const hostname = request.headers.get('host')

    // Handle specific domain routing
    if (hostname?.includes('1mackiegve.com')) {
      // If it's not the root path, continue as normal
      if (request.nextUrl.pathname !== '/') {
        return response
      }

      // For the root path of this domain, we'll fetch the property data
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('custom_domain', 'www.1mackiegve.com')
        .single()

      if (property) {
        // Rewrite to the property page but keep the URL as root
        const url = request.nextUrl.clone()
        url.pathname = `/properties/${property.id}`
        return NextResponse.rewrite(url)
      }
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

// Match all routes for testing
export const config = {
  matcher: ['/:path*']
} 