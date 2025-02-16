import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const pathname = request.nextUrl.pathname
  const url = request.url
  const searchParams = request.nextUrl.searchParams.toString()
  const fullUrl = searchParams ? `${url}?${searchParams}` : url

  // Log every request in detail
  console.log(JSON.stringify({
    message: '🔍 MIDDLEWARE REQUEST',
    timestamp: new Date().toISOString(),
    hostname,
    pathname,
    fullUrl,
    headers: Object.fromEntries(request.headers.entries()),
    searchParams: searchParams || null
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
      const supabase = createRouteHandlerClient({ cookies })

      // First, let's debug what's in the database
      const { data: allProperties, error: listError } = await supabase
        .from('properties')
        .select('id, custom_domain, status')
        .not('custom_domain', 'is', null)

      console.log(JSON.stringify({
        message: '📋 DEBUG: All properties with custom domains',
        properties: allProperties,
        error: listError,
        timestamp: new Date().toISOString()
      }))

      // Simple exact match query
      const { data: property, error } = await supabase
        .from('properties')
        .select('id, custom_domain, status')
        .eq('custom_domain', hostname)
        .eq('status', 'published')
        .single()

      console.log(JSON.stringify({
        message: '🔍 DEBUG: Exact match query result',
        query: {
          custom_domain: hostname,
          status: 'published'
        },
        result: property,
        error,
        timestamp: new Date().toISOString()
      }))

      // If no match with www, try without
      if (error && hostname.startsWith('www.')) {
        const nonWwwHostname = hostname.replace('www.', '')
        console.log(JSON.stringify({
          message: '🔄 DEBUG: Trying without www',
          originalHostname: hostname,
          nonWwwHostname,
          timestamp: new Date().toISOString()
        }))

        const { data: nonWwwProperty, error: nonWwwError } = await supabase
          .from('properties')
          .select('id, custom_domain, status')
          .eq('custom_domain', nonWwwHostname)
          .eq('status', 'published')
          .single()

        console.log(JSON.stringify({
          message: '🔍 DEBUG: Non-www query result',
          query: {
            custom_domain: nonWwwHostname,
            status: 'published'
          },
          result: nonWwwProperty,
          error: nonWwwError,
          timestamp: new Date().toISOString()
        }))

        if (!nonWwwError && nonWwwProperty) {
          console.log(JSON.stringify({
            message: '✅ Found property with non-www domain',
            hostname: nonWwwHostname,
            property: nonWwwProperty
          }))
          const newUrl = request.nextUrl.clone()
          newUrl.pathname = `/properties/${nonWwwProperty.id}`
          if (searchParams) newUrl.search = searchParams
          return NextResponse.rewrite(newUrl)
        }
      }

      if (error || !property) {
        console.log(JSON.stringify({
          message: '❌ No property found for domain',
          hostname,
          error: error?.message,
          details: error?.details,
          timestamp: new Date().toISOString()
        }))
        return NextResponse.next()
      }

      console.log(JSON.stringify({
        message: '✅ Found property for domain',
        hostname,
        property
      }))

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