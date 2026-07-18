import { createBrowserClient } from '@supabase/ssr'

// Browser singleton — uses @supabase/ssr so sessions are stored in cookies,
// making them readable by Next.js middleware for route protection.
// Placeholders during build: replaced at runtime by real env vars.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key'

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)
