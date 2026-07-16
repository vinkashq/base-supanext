import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import UserMenuItem from "./user-menu-item"
import Link from "next/link"
import { ChevronDownIcon, MessageCircleIcon, PenToolIcon, PlusIcon, Users2Icon, UsersIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function AdminSidebar() {
  return (
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader />
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel render={<CollapsibleTrigger />}>
              AI
              <ChevronDownIcon className="ml-auto transition-transform group-data-open/collapsible:rotate-180" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link href="/admin/chat" />}>
                      <MessageCircleIcon />
                      Chat
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel render={<CollapsibleTrigger />}>
              Blog
              <ChevronDownIcon className="ml-auto transition-transform group-data-open/collapsible:rotate-180" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem className="group/menu-item">
                    <SidebarMenuButton render={<Link href="/admin/blog/posts" />}>
                      <PenToolIcon />
                      Posts
                      <Link href="/admin/blog/post" className="ml-auto hidden group-hover/menu-item:block">
                        <PlusIcon />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
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