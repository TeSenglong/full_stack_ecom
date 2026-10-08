import { AdminChartAreaInteractive } from "@/app/admin/components/AdminChartAreaInteractive"
import { AdminDataTable } from "@/app/admin/components/AdminDataTable"
import { AdminSectionCards } from "@/app/admin/components/AdminSectionCards"
import { getAdminDashboardData } from "@/lib/api/admin-dashboard"
import { requireAdmin } from "@/lib/auth/server"

export default async function Page() {
  await requireAdmin()
  const dashboard = await getAdminDashboardData()

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <AdminSectionCards metrics={dashboard.metrics} />
      <div className="px-4 lg:px-6">
        <AdminChartAreaInteractive data={dashboard.revenue} />
      </div>
      <AdminDataTable orders={dashboard.recentOrders} />
    </div>
  )
}
