import {
  CircleCheckIcon,
  DollarSignIcon,
  PackageIcon,
  ShoppingBagIcon,
  TagsIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AdminDashboardMetrics } from "@/types/admin"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const numberFormatter = new Intl.NumberFormat("en-US")

export function AdminSectionCards({
  metrics,
}: {
  metrics: AdminDashboardMetrics
}) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {currencyFormatter.format(metrics.totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <DollarSignIcon />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">From non-cancelled orders</div>
          <div className="text-muted-foreground">
            {numberFormatter.format(metrics.cancelledOrders)} cancelled excluded
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {numberFormatter.format(metrics.totalOrders)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ShoppingBagIcon />
              {numberFormatter.format(metrics.openOrders)} open
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 font-medium">
            {numberFormatter.format(metrics.deliveredOrders)} delivered
            <CircleCheckIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">All recorded customer orders</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total products</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {numberFormatter.format(metrics.totalProducts)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <PackageIcon />
              Catalog
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Current product catalog</div>
          <div className="text-muted-foreground">Synced with the products API</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Categories</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {numberFormatter.format(metrics.totalCategories)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TagsIcon />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Product organization</div>
          <div className="text-muted-foreground">Synced with the categories API</div>
        </CardFooter>
      </Card>
    </div>
  )
}
