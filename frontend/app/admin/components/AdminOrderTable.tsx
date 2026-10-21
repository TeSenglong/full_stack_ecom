import { SearchIcon } from "lucide-react"
import Link from "next/link"

import { AdminOrderStatusBadge } from "@/app/admin/components/AdminOrderStatusBadge"
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
import type {
  AdminOrderPage,
  AdminOrderStatus,
} from "@/types/admin"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const date = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
]

function pageHref(
  page: number,
  query: string,
  basePath: string,
  status?: AdminOrderStatus,
) {
  const searchParams = new URLSearchParams({ page: String(page) })

  if (query) {
    searchParams.set("q", query)
  }

  if (status) {
    searchParams.set("status", status)
  }

  return `${basePath}?${searchParams}`
}

export function AdminOrderTable({
  orderPage,
  query,
  status,
  basePath = "/admin/orders",
}: {
  orderPage: AdminOrderPage
  query: string
  status?: AdminOrderStatus
  basePath?: string
}) {
  const currentPage = orderPage.page + 1

  return (
    <Card>
      <CardHeader className="border-b">
        <div>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {orderPage.totalContents.toLocaleString("en-US")} matching order
            {orderPage.totalContents === 1 ? "" : "s"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <form
          method="get"
          className="grid gap-3 border-b px-4 py-4 md:grid-cols-[minmax(0,1fr)_12rem_auto_auto]"
        >
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Order number, customer, email, or phone"
              className="h-9 pl-9"
            />
          </div>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className={buttonVariants({ size: "lg" })}
          >
            Apply filters
          </button>
          {(query || status) && (
            <Link
              href={basePath}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Reset
            </Link>
          )}
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="pr-4 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderPage.content.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-40 text-center text-muted-foreground"
                >
                  No orders match these filters.
                </TableCell>
              </TableRow>
            ) : (
              orderPage.content.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="pl-4">
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      ID {order.id}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56">
                    <div className="truncate font-medium">
                      {order.recipientName}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {order.customerEmail}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminOrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {order.items.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </TableCell>
                  <TableCell>{date.format(new Date(order.createdAt))}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {currency.format(Number(order.totalAmount))}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Link
                      href={`${basePath}/${order.id}`}
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

        {orderPage.totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {orderPage.totalPages}
            </p>
            <div className="flex gap-2">
              {orderPage.first ? (
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
                  href={pageHref(currentPage - 1, query, basePath, status)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Previous
                </Link>
              )}
              {orderPage.last ? (
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
                  href={pageHref(currentPage + 1, query, basePath, status)}
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
