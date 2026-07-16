import { AdminHeader } from "@/components/admin/header"
import AdminSidebar from "@/components/admin/sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Suspense } from "react"
import { Spinner } from "@/components/ui/spinner"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="max-h-[calc(100vh-16px)]">
        <AdminHeader />
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center p-8">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        }>
          {children}
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}