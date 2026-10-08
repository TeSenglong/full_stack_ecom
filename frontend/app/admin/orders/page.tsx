import { AdminOrderTable } from "@/app/admin/components/AdminOrderTable"
import { getAdminOrders } from "@/lib/api/admin-orders"
import { requireAdmin } from "@/lib/auth/server"
import type { AdminOrderStatus } from "@/types/admin"

const ORDERS_PER_PAGE = 20
const ORDER_STATUSES: AdminOrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(firstValue(value) ?? "1", 10)

  return Number.isFinite(page) && page > 0 ? page : 1
}

function parseStatus(value: string | string[] | undefined) {
  const status = firstValue(value)?.toUpperCase()

  return ORDER_STATUSES.includes(status as AdminOrderStatus)
    ? (status as AdminOrderStatus)
    : undefined
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[]
    q?: string | string[]
    status?: string | string[]
  }>
}) {
  await requireAdmin()

  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const query = firstValue(params.q)?.trim() ?? ""
  const status = parseStatus(params.status)
  const orderPage = await getAdminOrders({
    page: requestedPage - 1,
    size: ORDERS_PER_PAGE,
    query,
    status,
  })

  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Order management</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review customer purchases, delivery details, and fulfillment status.
        </p>
      </div>

      <AdminOrderTable orderPage={orderPage} query={query} status={status} />
    </section>
  )
}
