import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const createClient = async (schema: string = "public") => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      db: {
        schema: schema
      }
    }
  )
}