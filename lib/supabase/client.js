import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let supabaseInstance = null

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          storageKey: 'edudocs-auth',
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    )
  }
  return supabaseInstance
}
