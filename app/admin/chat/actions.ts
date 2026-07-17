"use server"

import chatTitler from "@/lib/genkit/tools/text/chat-titler"
import { createClient } from "@/lib/supabase/server"

export async function getSessions(userId: string) {
  const supabase = await createClient("genkit")
  const { data, error } = await supabase
    .from("sessions")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) {
    throw error
  }
  return data
}

export async function getSession(sessionId: string) {
  const supabase = await createClient("genkit")
  const { data, error } = await supabase
    .from("sessions")
    .select()
    .eq("id", sessionId)
    .maybeSingle()
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

export async function setSessionTitle(sessionId: string) {
  const supabase = await createClient("genkit")
  const { data: snapshotData, error: snapshotError } = await supabase
    .schema("genkit")
    .from("snapshots")
    .select("data")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (snapshotError) {
    throw snapshotError
  } else if (!snapshotData) {
    throw new Error("No snapshot found for session")
  }

  const messages = (snapshotData?.data as any)?.state?.messages || []

  if (messages.length === 0) {
    throw new Error("No messages found in session")
  }

  const title = await chatTitler(messages)

  const { data: updatedSession, error: updateError } = await supabase
    .schema("genkit")
    .from("sessions")
    .update({ title })
    .eq("id", sessionId)
    .select()
    .maybeSingle()

  if (updateError) {
    throw updateError
  } else if (!updatedSession) {
    throw new Error("No session found after update")
  }

  return title
}