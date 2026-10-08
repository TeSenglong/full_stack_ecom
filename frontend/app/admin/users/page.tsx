import { AdminUserTable } from "@/app/admin/components/AdminUserTable"
import { getAdminUsers } from "@/lib/api/admin-users"
import { requireAdmin } from "@/lib/auth/server"
import type { AdminUserRole } from "@/types/admin"

const USERS_PER_PAGE = 20

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(firstValue(value) ?? "1", 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function parseRole(value: string | string[] | undefined) {
  const role = firstValue(value)?.toUpperCase()
  return role === "USER" || role === "ADMIN"
    ? (role as AdminUserRole)
    : undefined
}

function parseEnabled(value: string | string[] | undefined) {
  const status = firstValue(value)?.toLowerCase()
  if (status === "active") return true
  if (status === "disabled") return false
  return undefined
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[]
    q?: string | string[]
    role?: string | string[]
    status?: string | string[]
  }>
}) {
  const currentAdmin = await requireAdmin()
  const params = await searchParams
  const requestedPage = parsePage(params.page)
  const query = firstValue(params.q)?.trim() ?? ""
  const role = parseRole(params.role)
  const enabled = parseEnabled(params.status)
  const userPage = await getAdminUsers({
    page: requestedPage - 1,
    size: USERS_PER_PAGE,
    query,
    role,
    enabled,
  })

  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-2 text-2xl font-semibold">User management</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Review customer accounts, manage administrator access, and suspend
          compromised accounts.
        </p>
      </div>

      <AdminUserTable
        userPage={userPage}
        currentAdminId={currentAdmin.id}
        query={query}
        role={role}
        enabled={enabled}
      />
    </section>
  )
}
