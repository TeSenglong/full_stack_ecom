import { Badge } from "@/components/ui/badge"
import type { AdminUserRole } from "@/types/admin"

export function AdminUserRoleBadge({ role }: { role: AdminUserRole }) {
  return (
    <Badge variant={role === "ADMIN" ? "default" : "outline"}>
      {role === "ADMIN" ? "Administrator" : "Customer"}
    </Badge>
  )
}

export function AdminUserStatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <Badge
      variant={enabled ? "secondary" : "destructive"}
      className={
        enabled
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          : undefined
      }
    >
      {enabled ? "Active" : "Disabled"}
    </Badge>
  )
}
