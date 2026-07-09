"use client"

import { useCurrentUser } from "@/hooks/use-current-user"
import { getSessions } from "./actions"
import { useEffect, useState } from "react"
import { SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import Link from "next/link"

export default function SessionsMenu() {
  const currentUser = useCurrentUser()
  const [sessions, setSessions] = useState<any[] | null>(null)

  useEffect(() => {
    if (!currentUser) {
      return
    }
    getSessions(currentUser.id).then((data) => {
      setSessions(data)
    })
  }, [currentUser])

  if (!currentUser) {
    return null
  }

  if (!sessions) {
    return <div>Loading...</div>
  }

  return (
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          {sessions.map((session) => (
            <Link key={session.id} href={`/admin/chat/${session.id}`}>
              <SidebarMenuButton className="cursor-pointer truncate">{new Date(session.created_at).toLocaleString()}</SidebarMenuButton>
            </Link>
          ))}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  )
}