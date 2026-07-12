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
import UserMenuItem from "@/components/admin/sidebar/user-menu-item"
import Link from "next/link"
import { ChevronDownIcon, MessageCircleIcon, Users2Icon, UsersIcon } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function AccountSidebar() {
  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
      <SidebarHeader />
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
          </SidebarGroup>
        </Collapsible>
        <SidebarGroup>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}