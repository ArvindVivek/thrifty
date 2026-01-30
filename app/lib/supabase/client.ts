// Supabase client for browser/client components
// Uses anon key for public data access with thrifty schema
// No auth persistence needed (anonymous access via RLS)

import { createClient } from '@supabase/supabase-js'

export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'thrifty' },
    auth: {
      persistSession: false,  // No auth sessions - anonymous access only
      autoRefreshToken: false
    }
  })
}
