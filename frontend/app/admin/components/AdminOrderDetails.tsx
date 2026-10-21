/* eslint-disable @next/next/no-img-element */

import {
  ArrowLeftIcon,
  BoxIcon,
  CalendarDaysIcon,
  MailIcon,
  MapPinIcon,
  PackageIcon,
  PhoneIcon,
  UserIcon,
  WalletCardsIcon,
} from "lucide-react"
import Link from "next/link"

import { AdminOrderStatusBadge } from "@/app/admin/components/AdminOrderStatusBadge"
import { AdminOrderStatusManager } from "@/app/admin/components/AdminOrderStatusManager"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AdminOrder, AdminOrderStatusAction } from "@/types/admin"

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const dateTime = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
})

export function AdminOrderDetails({
  order,
  ordersPath,
  productPath,
  updateStatusAction,
}: {
  order: AdminOrder
  ordersPath: string
  productPath: string
  updateStatusAction: AdminOrderStatusAction
}) {
  const itemCount = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <nav aria-label="Breadcrumb">
        <Link
          href={ordersPath}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Back to orders
        </Link>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-6">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <AdminOrderStatusBadge status={order.status} />
            <span className="font-mono text-xs text-muted-foreground">
              ID {order.id}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {order.orderNumber}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDaysIcon className="size-4" aria-hidden="true" />
            Placed {dateTime.format(new Date(order.createdAt))}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Order total
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {currency.format(Number(order.totalAmount))}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Order items</CardTitle>
              <CardDescription>
                {itemCount} item{itemCount === 1 ? "" : "s"} across{" "}
                {order.items.length} product{order.items.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y px-0">
              {order.items.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[4rem_minmax(0,1fr)_auto] gap-4 px-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                    {item.productImageUrl ? (
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PackageIcon
                        className="size-5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0 self-center">
                    <Link
                      href={`${productPath}/${item.productId}`}
                      className="line-clamp-2 font-medium hover:underline"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      SKU {item.productSku} · {currency.format(Number(item.price))}{" "}
                      × {item.quantity}
                    </p>
                  </div>
                  <p className="self-center font-medium tabular-nums">
                    {currency.format(Number(item.subtotal))}
                  </p>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Fulfillment status</CardTitle>
              <CardDescription>
                Update this order as it moves through fulfillment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminOrderStatusManager
                order={order}
                updateStatusAction={updateStatusAction}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <UserIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium">{order.recipientName}</p>
                  <p className="text-xs text-muted-foreground">
                    Customer ID {order.customerId}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <a
                  href={`mailto:${order.customerEmail}`}
                  className="min-w-0 break-all text-sm hover:underline"
                >
                  {order.customerEmail}
                </a>
              </div>
              <div className="flex gap-3">
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <a
                  href={`tel:${order.recipientPhone}`}
                  className="text-sm hover:underline"
                >
                  {order.recipientPhone}
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="whitespace-pre-line text-sm leading-6">
                  {order.shippingAddress}
                </p>
              </div>
              <div className="flex gap-3">
                <WalletCardsIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Payment method</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <BoxIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total quantity</p>
                  <p className="mt-0.5 text-sm font-medium">
                    {itemCount} item{itemCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
