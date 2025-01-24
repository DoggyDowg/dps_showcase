import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Add pathname to headers for server-side access
  res.headers.set('x-pathname', req.nextUrl.pathname)
  
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth condition
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      // If there's no session and we're not already on the login page
      if (req.nextUrl.pathname !== '/admin/login') {
        const redirectUrl = new URL('/admin/login', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // If there's a session and we're on the login page
      if (req.nextUrl.pathname === '/admin/login') {
        const redirectUrl = new URL('/admin', req.url)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
} 