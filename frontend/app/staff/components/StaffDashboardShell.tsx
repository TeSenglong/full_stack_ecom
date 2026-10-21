import type { User } from "@/app/(auth)/auth"
import { StaffSidebar } from "@/app/staff/components/StaffSidebar"
import { StaffSiteHeader } from "@/app/staff/components/StaffSiteHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function StaffDashboardShell({
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
      <StaffSidebar user={user} variant="inset" />
      <SidebarInset>
        <StaffSiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
