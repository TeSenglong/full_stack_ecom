import { StaffDashboardShell } from "@/app/staff/components/StaffDashboardShell"
import { requireStaff } from "@/lib/auth/server"

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireStaff()

  return <StaffDashboardShell user={user}>{children}</StaffDashboardShell>
}
