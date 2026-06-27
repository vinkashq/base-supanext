import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import UserMenuItem from "./user-menu-item"
import Link from "next/link"
import { Users2Icon, UsersIcon } from "lucide-react"

export default function AdminSidebar() {
  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup></SidebarGroup>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/admin/users" />}>
                <UsersIcon />
                Users
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <UserMenuItem />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}