import { setSessionTitle } from "@/app/admin/chat/actions"
import chatTitler from "@/lib/genkit/tools/text/chat-titler"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .schema("genkit")
    .from("sessions")
    .select("id")
    .is("title", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  } else if (!data) {
    return NextResponse.json({ error: "No session found without title" })
  }

  const title = await setSessionTitle(data.id)

  return NextResponse.json({ title })
}