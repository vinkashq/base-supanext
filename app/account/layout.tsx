import AccountSidebar from "@/components/account/sidebar"
import { AdminHeader } from "@/components/admin/header"
import Header from "@/components/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="[--header-height:calc(--spacing(14))] w-full">
      <SidebarProvider className="flex flex-col">
        <Header />
        <div className="flex flex-1">
          <AccountSidebar />
          <SidebarInset className="max-h-[calc(100vh-16px-var(--header-height))]">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}