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

export async function getSessionMessages(sessionId: string) {
  const supabase = await createClient("genkit")
  const { data, error } = await supabase
    .from("snapshots")
    .select("data")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return (data?.data as any)?.state?.messages || []
}