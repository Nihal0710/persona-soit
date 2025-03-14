import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Check if we're on localhost and need to redirect to the deployed site
  const url = req.nextUrl.clone()
  const hostname = req.headers.get('host') || ''
  
  // If we're on localhost and it's not a static asset or API route
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    const path = url.pathname
    
    // If this is after a Google login redirect
    if (path.includes('/auth/callback') || path === '/#' || path === '/') {
      // Redirect to the deployed site's quiz page
      return NextResponse.redirect('https://persona-soit.vercel.app/quiz')
    }
  }
  
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    
    // Refresh session if expired
    await supabase.auth.getSession()
  } catch (error) {
    console.error('Middleware error:', error)
  }
  
  return res
}

// Only run middleware on auth-related paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 