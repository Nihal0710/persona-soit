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

    // After successful authentication, redirect to the deployed Vercel URL
    return NextResponse.redirect('https://persona-soit.vercel.app/quiz')
  } catch (error) {
    console.error('Auth callback error:', error)
    // Redirect to the deployed error page
    return NextResponse.redirect('https://persona-soit.vercel.app/auth-error')
  }
} 