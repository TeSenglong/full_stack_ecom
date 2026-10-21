import { notFound, unstable_rethrow } from "next/navigation"

import { AdminOrderDetails } from "@/app/admin/components/AdminOrderDetails"
import { updateStaffOrderStatusAction } from "@/app/staff/orders/[id]/actions"
import { getAdminOrderById } from "@/lib/api/admin-orders"
import { requireStaff } from "@/lib/auth/server"

export default async function StaffOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff()
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
      ordersPath="/staff/orders"
      productPath="/products"
      updateStatusAction={updateStaffOrderStatusAction}
    />
  )
}
