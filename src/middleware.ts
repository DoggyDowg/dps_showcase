import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Middleware initialization:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseKey,
  timestamp: new Date().toISOString()
})

if (!supabaseUrl || !supabaseKey) {
  console.error('🔴 Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  })
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: false
    }
  }
)

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const pathname = request.nextUrl.pathname
  const url = request.url

  console.log('🚀 Middleware called:', { 
    hostname, 
    pathname, 
    url,
    headers: Object.fromEntries(request.headers.entries()),
    time: new Date().toISOString()
  })

  // Skip middleware for Next.js internals and static files
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('favicon') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api')
  ) {
    console.log('⏭️ Skipping internal path:', pathname)
    return NextResponse.next()
  }

  try {
    console.log('🔍 Querying Supabase for domain:', hostname)
    
    // Query Supabase for property with matching custom domain
    const { data: property, error, status } = await supabase
      .from('properties')
      .select('id, name, custom_domain')
      .eq('custom_domain', hostname)
      .single()

    console.log('📊 Supabase response:', {
      status,
      hasData: !!property,
      hasError: !!error,
      error: error?.message,
      property,
      timestamp: new Date().toISOString()
    })

    if (error) {
      console.error('❌ Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.next()
    }

    if (property) {
      console.log('✅ Found property:', property)
      
      const url = request.nextUrl.clone()
      url.pathname = `/properties/${property.id}`
      
      console.log('↪️ Rewriting to:', {
        from: pathname,
        to: url.pathname,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.rewrite(url)
    } else {
      console.log('❌ No property found for domain:', hostname)
    }
  } catch (error) {
    console.error('💥 Middleware error:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    })
  }

  console.log('➡️ Continuing with original request:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. all files in /public
     */
    '/((?!api|_next|static|[\\w-]+\\.\\w+).*)',
  ],
} 