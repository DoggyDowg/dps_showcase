import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('🔴 Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  })
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
)

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  const pathname = request.nextUrl.pathname
  const url = request.url

  console.log('🚨 MIDDLEWARE START:', { 
    hostname, 
    pathname, 
    url,
    time: new Date().toISOString(),
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey
  })

  // Skip middleware for Next.js internals
  if (pathname.startsWith('/_next') || pathname.includes('favicon')) {
    console.log('⏭️ Skipping internal path:', pathname)
    return NextResponse.next()
  }

  try {
    console.log('🔍 Querying Supabase for domain:', hostname)
    
    // Query Supabase for property with matching custom domain
    const { data: property, error } = await supabase
      .from('properties')
      .select('id, name, custom_domain')
      .eq('custom_domain', hostname)
      .single()

    console.log('📊 Supabase response:', {
      hasData: !!property,
      hasError: !!error,
      error: error?.message,
      property
    })

    if (error) {
      throw error
    }

    if (property) {
      console.log('✅ Found property:', property)
      
      const url = request.nextUrl.clone()
      url.pathname = `/properties/${property.id}`
      console.log('↪️ Rewriting to:', url.pathname)
      return NextResponse.rewrite(url)
    } else {
      console.log('❌ No property found for domain:', hostname)
    }
  } catch (error) {
    console.error('💥 Middleware error:', error instanceof Error ? error.message : error)
  }

  console.log('➡️ Continuing with original request:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 