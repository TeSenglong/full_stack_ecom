import { AdminDashboardShell } from "@/app/admin/components/AdminDashboardShell"
import { requireAdmin } from "@/lib/auth/server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAdmin()

  return <AdminDashboardShell user={user}>{children}</AdminDashboardShell>
}
