import AccountSidebar from "@/components/account/sidebar"
import Header from "@/components/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Suspense } from "react"
import { Spinner } from "@/components/ui/spinner"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="[--header-height:calc(--spacing(14))] w-full">
      <SidebarProvider className="flex flex-col">
        <Header />
        <div className="flex flex-1">
          <AccountSidebar />
          <SidebarInset className="max-h-[calc(100vh-16px-var(--header-height))]">
            <Suspense fallback={
              <div className="flex h-full w-full items-center justify-center p-8">
                <Spinner className="size-6 text-muted-foreground" />
              </div>
            }>
              {children}
            </Suspense>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}