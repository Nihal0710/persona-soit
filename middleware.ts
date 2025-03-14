import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Create a response object that will be modified with the session
  const res = NextResponse.next()
  
  try {
    const supabase = createMiddlewareClient({ req, res })
    
    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession()
    
    // Check for protected routes that require authentication
    const isProtectedRoute = req.nextUrl.pathname.includes('/dashboard') || 
                            (req.nextUrl.pathname.includes('/quiz') && req.nextUrl.pathname !== '/quiz')
    
    // If accessing a protected route without a session, redirect to login
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/quiz', req.url)
      return NextResponse.redirect(redirectUrl)
    }
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