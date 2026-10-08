import { AdminSidebar } from "@/app/admin/components/AdminSidebar"
import { AdminSiteHeader } from "@/app/admin/components/AdminSiteHeader"
import type { User } from "@/app/(auth)/auth"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AdminDashboardShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: User
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar user={user} variant="inset" />
      <SidebarInset>
        <AdminSiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
