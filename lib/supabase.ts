import { createClient } from "@supabase/supabase-js"

// These checks will only run on the server
let supabaseUrl: string
let supabaseKey: string

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Browser - use environment variables directly
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
} else {
  // Server - validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }

