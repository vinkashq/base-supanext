"use client"

import { CurrentUserAvatar } from "@/components/current-user-avatar"
import { LogoutButton } from "@/components/logout-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useLogout } from "@/hooks/use-logout"
import { EllipsisVerticalIcon, LogOutIcon } from "lucide-react"

export default function UserMenuItem() {
  const user = useCurrentUser()
  const { isMobile } = useSidebar()
  const { logout, isPending } = useLogout()

  if (!user) return null

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger render={<SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        />}>
          <CurrentUserAvatar />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.user_metadata.full_name || user.email?.split('@')[0]}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
          <EllipsisVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuItem onClick={() => logout()} disabled={isPending} className="flex items-center gap-2">
            <LogOutIcon className="h-4 w-4 text-muted-foreground" />
            <span>{isPending ? "Logging out..." : "Log out"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem >
  )
}