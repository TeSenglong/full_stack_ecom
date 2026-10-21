import { SearchIcon } from "lucide-react"
import Link from "next/link"

import {
  AdminUserRoleBadge,
  AdminUserStatusBadge,
} from "@/app/admin/components/AdminUserBadges"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { AdminUserPage, AdminUserRole } from "@/types/admin"

const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  )
}

function pageHref(
  page: number,
  query: string,
  role?: AdminUserRole,
  enabled?: boolean,
) {
  const searchParams = new URLSearchParams({ page: String(page) })

  if (query) searchParams.set("q", query)
  if (role) searchParams.set("role", role)
  if (typeof enabled === "boolean") {
    searchParams.set("status", enabled ? "active" : "disabled")
  }

  return `/admin/users?${searchParams}`
}

export function AdminUserTable({
  userPage,
  currentAdminId,
  query,
  role,
  enabled,
}: {
  userPage: AdminUserPage
  currentAdminId: number
  query: string
  role?: AdminUserRole
  enabled?: boolean
}) {
  const currentPage = userPage.page + 1
  const filtered = Boolean(query || role || typeof enabled === "boolean")

  return (
    <Card>
      <CardHeader className="border-b">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {userPage.totalContents.toLocaleString("en-US")} matching account
            {userPage.totalContents === 1 ? "" : "s"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <form
          method="get"
          className="grid gap-3 border-b px-4 py-4 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_auto_auto]"
        >
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search name or email"
              className="h-9 pl-9"
            />
          </div>
          <select
            name="role"
            defaultValue={role ?? ""}
            aria-label="Filter by role"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All roles</option>
            <option value="USER">Customers</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Administrators</option>
          </select>
          <select
            name="status"
            defaultValue={
              typeof enabled === "boolean"
                ? enabled
                  ? "active"
                  : "disabled"
                : ""
            }
            aria-label="Filter by account status"
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <button type="submit" className={buttonVariants({ size: "lg" })}>
            Apply filters
          </button>
          {filtered && (
            <Link
              href="/admin/users"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Reset
            </Link>
          )}
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="pr-4 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userPage.content.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-40 text-center text-muted-foreground"
                >
                  No users match these filters.
                </TableCell>
              </TableRow>
            ) : (
              userPage.content.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="lg">
                        {user.avatarUrl && (
                          <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                        )}
                        <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {user.displayName}
                          </span>
                          {user.id === currentAdminId && (
                            <span className="text-xs text-muted-foreground">You</span>
                          )}
                        </div>
                        <p className="max-w-64 truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminUserRoleBadge role={user.role} />
                  </TableCell>
                  <TableCell>
                    <AdminUserStatusBadge enabled={user.enabled} />
                  </TableCell>
                  <TableCell>{user.emailVerified ? "Yes" : "No"}</TableCell>
                  <TableCell>{date.format(new Date(user.createdAt))}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {userPage.totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {userPage.totalPages}
            </p>
            <div className="flex gap-2">
              {userPage.first ? (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  Previous
                </span>
              ) : (
                <Link
                  href={pageHref(currentPage - 1, query, role, enabled)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Previous
                </Link>
              )}
              {userPage.last ? (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  Next
                </span>
              ) : (
                <Link
                  href={pageHref(currentPage + 1, query, role, enabled)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
