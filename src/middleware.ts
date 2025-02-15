import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use a more reliable logging approach
const log = async (message: string, data: any = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    message,
    ...data
  }
  
  // Log to stdout (captured by Vercel)
  process.stdout.write(JSON.stringify(logEntry) + '\n')
}

// Log initialization
log('Middleware initialization', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseKey
})

if (!supabaseUrl || !supabaseKey) {
  log('Missing Supabase environment variables', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    severity: 'error'
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

  await log('Middleware called', { 
    hostname, 
    pathname, 
    url,
    headers: Object.fromEntries(request.headers.entries())
  })

  // Skip middleware for Next.js internals and static files
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('favicon') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api')
  ) {
    await log('Skipping internal path', { pathname })
    return NextResponse.next()
  }

  try {
    await log('Querying Supabase for domain', { hostname })
    
    // Query Supabase for property with matching custom domain
    const { data: property, error, status } = await supabase
      .from('properties')
      .select('id, name, custom_domain')
      .eq('custom_domain', hostname)
      .single()

    await log('Supabase response', {
      status,
      hasData: !!property,
      hasError: !!error,
      error: error?.message,
      property
    })

    if (error) {
      await log('Supabase query error', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status,
        severity: 'error'
      })

      // If it's a "not found" error, continue normally
      if (error.code === 'PGRST116') {
        await log('No property found for domain', { hostname })
        return NextResponse.next()
      }

      // For other errors, return a 500 error
      await log('Critical Supabase error', { error, severity: 'error' })
      return new NextResponse('Internal Server Error', { status: 500 })
    }

    if (property) {
      await log('Found property', { property })
      
      const url = request.nextUrl.clone()
      url.pathname = `/properties/${property.id}`
      
      await log('Rewriting to', {
        from: pathname,
        to: url.pathname
      })
      
      return NextResponse.rewrite(url)
    } else {
      await log('No property found for domain', { hostname })
    }
  } catch (error) {
    await log('Middleware error', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error,
      severity: 'error'
    })
    return new NextResponse('Internal Server Error', { status: 500 })
  }

  await log('Continuing with original request', { pathname })
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