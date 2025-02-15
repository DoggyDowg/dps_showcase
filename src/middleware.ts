import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Define a type for log data
interface LogData {
  timestamp: string;
  message: string;
  [key: string]: unknown;
}

// Use console.log for Edge Runtime
const log = async (message: string, data: Record<string, unknown> = {}) => {
  const logEntry: LogData = {
    timestamp: new Date().toISOString(),
    message,
    ...data
  }
  
  // Use console.log which is supported in Edge Runtime
  console.log(JSON.stringify(logEntry))
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

  // Log basic request information
  console.log(JSON.stringify({
    message: '🔍 TEST MIDDLEWARE TRIGGERED',
    timestamp: new Date().toISOString(),
    hostname,
    pathname,
    url
  }))

  // For testing, let's add a custom header to verify middleware execution
  const response = NextResponse.next()
  response.headers.set('x-middleware-test', 'true')
  
  return response
}

// Match all routes for testing
export const config = {
  matcher: ['/:path*']
} 