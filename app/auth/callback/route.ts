import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      // Exchange code for session and handle errors
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        throw error
      }
      
      // Verify session was created successfully
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Failed to create session')
      }
    }

    // Get the origin from the request URL
    const origin = new URL(request.url).origin
    
    // After successful authentication, redirect to the home page
    return NextResponse.redirect(`${origin}/`)
  } catch (error) {
    console.error('Auth callback error:', error)
    
    // Get the origin from the request URL
    const origin = new URL(request.url).origin
    
    // Redirect to the error page
    return NextResponse.redirect(`${origin}/auth-error`)
  }
} 