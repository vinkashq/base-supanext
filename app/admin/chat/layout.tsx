import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import SessionsMenu from "./sessions-menu"
import { Button } from "@/components/ui/button"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="min-h-0 flex-1">
      <Sidebar
        collapsible="none"
        className="border-l border-t lg:flex"
      >
        <SidebarHeader className="my-4">
          <Link href="/admin/chat">
            <SidebarMenuButton className="justify-center" render={<Button />}>
              <PlusIcon />
              New Chat
            </SidebarMenuButton>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SessionsMenu />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider >
  )
}