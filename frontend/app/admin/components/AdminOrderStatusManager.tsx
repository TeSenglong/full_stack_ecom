"use client"

import { LoaderCircleIcon } from "lucide-react"
import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { updateAdminOrderStatusAction } from "@/app/admin/orders/[id]/actions"
import type { AdminOrderStatusActionState } from "@/app/admin/orders/[id]/actions"
import { Button } from "@/components/ui/button"
import type { AdminOrder, AdminOrderStatus } from "@/types/admin"

const INITIAL_STATE: AdminOrderStatusActionState = {
  status: "idle",
  message: "",
}

const NEXT_STATUSES: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
}

const ACTION_LABELS: Record<AdminOrderStatus, string> = {
  PENDING: "Mark pending",
  CONFIRMED: "Confirm order",
  SHIPPED: "Mark as shipped",
  DELIVERED: "Mark as delivered",
  CANCELLED: "Cancel order",
}

export function AdminOrderStatusManager({ order }: { order: AdminOrder }) {
  const router = useRouter()
  const action = updateAdminOrderStatusAction.bind(null, String(order.id))
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE)
  const nextStatuses = NEXT_STATUSES[order.status]

  useEffect(() => {
    if (state.status === "success") {
      router.refresh()
    }
  }, [router, state.status])

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        {order.status === "DELIVERED"
          ? "This order is complete and has no further status actions."
          : "This order was cancelled and cannot be changed."}
      </p>
    )
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null

        if (
          submitter?.value === "CANCELLED" &&
          !window.confirm(
            "Cancel this order? Product stock will be restored and this cannot be undone.",
          )
        ) {
          event.preventDefault()
        }
      }}
      className="space-y-4"
    >
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            type="submit"
            name="status"
            value={status}
            variant={status === "CANCELLED" ? "destructive" : "default"}
            disabled={pending}
          >
            {pending && <LoaderCircleIcon className="animate-spin" />}
            {ACTION_LABELS[status]}
          </Button>
        ))}
      </div>

      {state.message && (
        <p
          role="status"
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-emerald-700"
          }
        >
          {state.message}
        </p>
      )}

      {nextStatuses.includes("CANCELLED") && (
        <p className="text-xs leading-5 text-muted-foreground">
          Cancelling restores the quantities from this order to product stock.
        </p>
      )}
    </form>
  )
}
