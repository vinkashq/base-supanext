"use server"

import { createClient } from "@/lib/supabase/server"

export async function getSessions(userId: string) {
  const supabase = await createClient("genkit")
  const { data, error } = await supabase.from("sessions").select().eq("user_id", userId)
  if (error) {
    throw error
  }
  return data
}