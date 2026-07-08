import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenuButton, SidebarProvider } from "@/components/ui/sidebar"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import Sessions from "./sessions"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar
        collapsible="none"
        className="sticky top-0 hidden h-svh border-l lg:flex"
      >
        <SidebarHeader>
          <Link href="/admin/chat">
            <SidebarMenuButton variant="outline" className="justify-center">
              <PlusIcon />
              New Chat
            </SidebarMenuButton>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <Sessions />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider >
  )
}