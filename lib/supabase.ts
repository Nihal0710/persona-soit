import { createClient } from "@supabase/supabase-js"

// These checks will only run on the server
let supabaseUrl: string
let supabaseKey: string

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Browser - use environment variables directly
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://habkcshdrtzrtwmvpeby.supabase.co'
  supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhYmtjc2hkcnR6cnR3bXZwZWJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3Njk1NTUsImV4cCI6MjA1NzM0NTU1NX0.dStm9m1mDXYywPkWWnmVUp5y9Y6QNbJQtkQ3m19T0cU'
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

