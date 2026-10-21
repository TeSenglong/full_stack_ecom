import { AdminChartAreaInteractive } from "@/app/admin/components/AdminChartAreaInteractive"
import { AdminDataTable } from "@/app/admin/components/AdminDataTable"
import { AdminSectionCards } from "@/app/admin/components/AdminSectionCards"
import { getAdminDashboardData } from "@/lib/api/admin-dashboard"
import { requireStaff } from "@/lib/auth/server"

export default async function StaffDashboardPage() {
  await requireStaff()
  const dashboard = await getAdminDashboardData()

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <section className="px-4 lg:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Staff workspace
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Store operations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Monitor incoming orders and keep fulfillment moving.
        </p>
      </section>
      <AdminSectionCards metrics={dashboard.metrics} />
      <div className="px-4 lg:px-6">
        <AdminChartAreaInteractive data={dashboard.revenue} />
      </div>
      <AdminDataTable
        orders={dashboard.recentOrders}
        ordersPath="/staff/orders"
      />
    </div>
  )
}
