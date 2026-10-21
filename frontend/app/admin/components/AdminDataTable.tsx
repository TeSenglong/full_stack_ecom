import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AdminOrder, AdminOrderStatus } from "@/types/admin"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function statusClassName(status: AdminOrderStatus) {
  switch (status) {
    case "DELIVERED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
    case "SHIPPED":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300"
    case "CONFIRMED":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
    case "CANCELLED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
    default:
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
  }
}

function formatStatus(status: AdminOrderStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase()
}

export function AdminDataTable({
  orders,
  ordersPath = "/admin/orders",
}: {
  orders: AdminOrder[]
  ordersPath?: string
}) {
  return (
    <section className="px-4 lg:px-6">
      <Card>
        <CardHeader className="border-b">
          <div>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest purchases from the orders API</CardDescription>
          </div>
          <CardAction>
            <Link
              href={ordersPath}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              View all orders
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          {orders.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center px-6 text-center text-sm text-muted-foreground">
              No orders found yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="pr-4 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="pl-4 font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.recipientName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusClassName(order.status)}
                      >
                        {formatStatus(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.items.reduce((total, item) => total + item.quantity, 0)}
                    </TableCell>
                    <TableCell>{dateFormatter.format(new Date(order.createdAt))}</TableCell>
                    <TableCell className="pr-4 text-right font-medium tabular-nums">
                      {currencyFormatter.format(Number(order.totalAmount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
