import { notFound, unstable_rethrow } from "next/navigation"

import { AdminOrderDetails } from "@/app/admin/components/AdminOrderDetails"
import { updateAdminOrderStatusAction } from "@/app/admin/orders/[id]/actions"
import { getAdminOrderById } from "@/lib/api/admin-orders"
import { requireAdmin } from "@/lib/auth/server"

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  if (!/^\d+$/.test(id) || Number(id) < 1) {
    notFound()
  }

  let order

  try {
    order = await getAdminOrderById(id)
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof Error && error.message.includes("(404)")) {
      notFound()
    }
    throw error
  }

  return (
    <AdminOrderDetails
      order={order}
      ordersPath="/admin/orders"
      productPath="/admin/products"
      updateStatusAction={updateAdminOrderStatusAction}
    />
  )
}
