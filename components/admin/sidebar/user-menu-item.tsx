"use client"

import { CurrentUserAvatar } from "@/components/current-user-avatar"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/use-current-user"
import { EllipsisVerticalIcon } from "lucide-react"

export default function UserMenuItem() {
  const user = useCurrentUser()

  if (!user) return null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <CurrentUserAvatar />
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.user_metadata.full_name || user.email?.split('@')[0]}</span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </div>
        <EllipsisVerticalIcon />
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}