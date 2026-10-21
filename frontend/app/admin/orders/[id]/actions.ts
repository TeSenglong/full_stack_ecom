"use server"

import { revalidatePath } from "next/cache"

import { updateAdminOrderStatus } from "@/lib/api/admin-orders"
import { requireAdmin } from "@/lib/auth/server"
import type {
  AdminOrderStatus,
  AdminOrderStatusActionState,
} from "@/types/admin"

const ORDER_STATUSES = new Set<AdminOrderStatus>([
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
])

export async function updateAdminOrderStatusAction(
  orderId: string,
  _previousState: AdminOrderStatusActionState,
  formData: FormData,
): Promise<AdminOrderStatusActionState> {
  await requireAdmin()

  if (!/^\d+$/.test(orderId) || Number(orderId) < 1) {
    return { status: "error", message: "Invalid order identifier." }
  }

  const requestedStatus = String(formData.get("status") ?? "")

  if (!ORDER_STATUSES.has(requestedStatus as AdminOrderStatus)) {
    return { status: "error", message: "Select a valid order status." }
  }

  try {
    await updateAdminOrderStatus(
      orderId,
      requestedStatus as AdminOrderStatus,
    )
    revalidatePath("/admin")
    revalidatePath("/admin/orders")
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/staff")
    revalidatePath("/staff/orders")
    revalidatePath(`/staff/orders/${orderId}`)

    return {
      status: "success",
      message: `Order status changed to ${requestedStatus.toLowerCase()}.`,
    }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to update the order status.",
    }
  }
}
