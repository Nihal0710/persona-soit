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
      await supabase.auth.exchangeCodeForSession(code)
    }

    // Always redirect to the deployed site's quiz page
    return NextResponse.redirect('https://persona-soit.vercel.app/quiz')
  } catch (error) {
    console.error('Auth callback error:', error)
    // Always redirect to the deployed site's error page
    return NextResponse.redirect('https://persona-soit.vercel.app/auth-error')
  }
} 