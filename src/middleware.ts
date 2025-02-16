import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

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

  // Skip if we're already on a property page
  if (pathname.startsWith('/properties/')) {
    console.log(JSON.stringify({
      message: '⏭️ ALREADY ON PROPERTIES PATH',
      pathname
    }))
    return NextResponse.next()
  }

  // Handle custom domains
  if (hostname && !hostname.includes('localhost') && !hostname.includes('vercel.app')) {
    try {
      // Create Supabase client
      const supabase = createRouteHandlerClient({ cookies })
      
      // Query the properties table to find the property with this custom domain
      const { data: property, error } = await supabase
        .from('properties')
        .select('id, status')
        .eq('custom_domain', hostname)
        .eq('status', 'published')
        .single()

      if (error || !property) {
        console.log(JSON.stringify({
          message: '❌ NO PROPERTY FOUND FOR DOMAIN',
          hostname,
          error: error?.message
        }))
        return NextResponse.next()
      }

      // Rewrite to the property page
      const newUrl = request.nextUrl.clone()
      newUrl.pathname = `/properties/${property.id}`
      
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
    } catch (err) {
      console.error('Middleware error:', err)
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

// Match all routes for testing
export const config = {
  matcher: ['/:path*']
} 