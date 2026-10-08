import { Badge } from "@/components/ui/badge"
import type { AdminOrderStatus } from "@/types/admin"

const STATUS_STYLES: Record<AdminOrderStatus, string> = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  CONFIRMED:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  SHIPPED:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  DELIVERED:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  CANCELLED:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
}

export function formatAdminOrderStatus(status: AdminOrderStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export function AdminOrderStatusBadge({
  status,
}: {
  status: AdminOrderStatus
}) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status]}>
      {formatAdminOrderStatus(status)}
    </Badge>
  )
}
