"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

export const useLogout = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const logout = async () => {
    startTransition(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
    })
  }

  return { logout, isPending }
}