"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { AdminRevenuePoint } from "@/types/admin"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function formatAxisCurrency(value: number) {
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`
  }

  return `$${value}`
}

export function AdminChartAreaInteractive({
  data,
}: {
  data: AdminRevenuePoint[]
}) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState<string | null>(null)
  const selectedTimeRange = timeRange ?? (isMobile ? "7d" : "90d")

  const filteredData = React.useMemo(() => {
    const days = selectedTimeRange === "7d" ? 7 : selectedTimeRange === "30d" ? 30 : 90
    return data.slice(-days)
  }, [data, selectedTimeRange])

  const rangeRevenue = filteredData.reduce(
    (total, point) => total + point.revenue,
    0,
  )
  const rangeOrders = filteredData.reduce(
    (total, point) => total + point.orders,
    0,
  )

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Order revenue</CardTitle>
        <CardDescription>
          {currencyFormatter.format(rangeRevenue)} from {rangeOrders.toLocaleString()} order
          {rangeOrders === 1 ? "" : "s"} in this period
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={[selectedTimeRange]}
            onValueChange={(value) => setTimeRange(value[0] ?? null)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={selectedTimeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select chart period"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <AreaChart data={filteredData} accessibilityLayer>
            <defs>
              <linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.08}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) =>
                new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={formatAxisCurrency}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const date = payload[0]?.payload?.date as string | undefined
                    return date
                      ? new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: "UTC",
                        })
                      : ""
                  }}
                  formatter={(value) => (
                    <div className="flex flex-1 items-center justify-between gap-8">
                      <span className="text-muted-foreground">Revenue</span>
                      <span className="font-mono font-medium tabular-nums">
                        {currencyFormatter.format(Number(value))}
                      </span>
                    </div>
                  )}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="revenue"
              type="monotone"
              fill="url(#adminRevenueFill)"
              stroke="var(--color-revenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
