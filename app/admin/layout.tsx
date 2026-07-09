import { AdminHeader } from "@/components/admin/header"
import AdminSidebar from "@/components/admin/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="max-h-[calc(100vh-16px)]">
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}