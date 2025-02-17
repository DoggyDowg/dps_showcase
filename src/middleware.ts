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
    
    // Add more detailed logging
    console.log('[Middleware] Processing request:', {
      hostname,
      path: request.nextUrl.pathname,
      headers: Object.fromEntries(request.headers.entries())
    });

    // Handle specific domain routing
    if (hostname?.includes('1mackiegve.com')) {
      // Set custom domain flag in a way that persists to the client
      const customDomainResponse = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
      
      // Add custom domain header
      customDomainResponse.headers.set('x-is-custom-domain', 'true')
      
      // If it's not the root path, continue as normal
      if (request.nextUrl.pathname !== '/') {
        console.log('[Middleware] Non-root path on custom domain:', request.nextUrl.pathname);
        return customDomainResponse
      }

      // For the root path of this domain, we'll fetch the property data
      console.log('[Middleware] Fetching property data for custom domain');
      const { data: property } = await supabase
        .from('properties')
        .select('*')
        .eq('custom_domain', hostname)
        .single()

      if (property) {
        console.log('[Middleware] Property found, rewriting to:', `/properties/${property.id}`);
        // Rewrite to the property page but keep the URL as root
        const url = request.nextUrl.clone()
        url.pathname = `/properties/${property.id}`
        return NextResponse.rewrite(url, {
          headers: customDomainResponse.headers
        })
      }
    }

    return response
  } catch (error) {
    console.error('[Middleware] Error:', error)
    return response
  }
}

// Match all routes for testing
export const config = {
  matcher: ['/:path*']
} 