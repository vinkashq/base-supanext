"use server"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

export const createAdminClient = async () => {
  return createClient(supabaseUrl!, supabaseKey!)
}