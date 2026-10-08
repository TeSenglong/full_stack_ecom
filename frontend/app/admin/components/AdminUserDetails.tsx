import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  MailIcon,
  PackageSearchIcon,
  UserRoundIcon,
} from "lucide-react"
import Link from "next/link"

import {
  AdminUserRoleBadge,
  AdminUserStatusBadge,
} from "@/app/admin/components/AdminUserBadges"
import { AdminUserManager } from "@/app/admin/components/AdminUserManager"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AdminUser } from "@/types/admin"

const dateTime = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
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

export function AdminUserDetails({
  user,
  currentAdminId,
}: {
  user: AdminUser
  currentAdminId: number
}) {
  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <nav aria-label="Breadcrumb">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to users
        </Link>
      </nav>

      <div className="flex flex-wrap items-center gap-5 border-b pb-6">
        <Avatar className="size-16 text-lg">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
          )}
          <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <AdminUserRoleBadge role={user.role} />
            <AdminUserStatusBadge enabled={user.enabled} />
            {user.id === currentAdminId && (
              <span className="text-xs font-medium text-muted-foreground">
                Current account
              </span>
            )}
          </div>
          <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
            {user.displayName}
          </h1>
          <p className="mt-1 break-all text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Account information</CardTitle>
              <CardDescription>
                Identity and account lifecycle information from the database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-6 sm:grid-cols-2">
                <div className="flex gap-3">
                  <UserRoundIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">User ID</dt>
                    <dd className="mt-1 font-mono text-sm">{user.id}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Email</dt>
                    <dd className="mt-1 break-all text-sm">{user.email}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Email verified</dt>
                    <dd className="mt-1 text-sm">
                      {user.emailVerified ? "Verified" : "Not verified"}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarDaysIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Created</dt>
                    <dd className="mt-1 text-sm">
                      {dateTime.format(new Date(user.createdAt))}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3 sm:col-span-2">
                  <Clock3Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Last updated</dt>
                    <dd className="mt-1 text-sm">
                      {dateTime.format(new Date(user.updatedAt))}
                    </dd>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer activity</CardTitle>
              <CardDescription>
                Find orders placed with this account&apos;s email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href={`/admin/orders?q=${encodeURIComponent(user.email)}`}
                className={buttonVariants({ variant: "outline" })}
              >
                <PackageSearchIcon />
                View matching orders
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Manage access</CardTitle>
            <CardDescription>
              Change permissions or suspend access to this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminUserManager user={user} currentAdminId={currentAdminId} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
