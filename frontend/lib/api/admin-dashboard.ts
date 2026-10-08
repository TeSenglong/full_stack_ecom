import "server-only"

import { cookies } from "next/headers"

import type {
  AdminDashboardData,
  AdminOrder,
  AdminRevenuePoint,
} from "@/types/admin"
import type { Product } from "@/types/product"

const BACKEND_URL = process.env.BACKEND_URL
const API_TIMEOUT_MS = 5_000
const PAGE_SIZE = 100
const CHART_DAYS = 90
const RECENT_ORDER_COUNT = 8

interface PageResponse<T> {
  page: number
  content: T[]
  size: number
  totalContents: number
  totalPages: number
  first: boolean
  last: boolean
}

interface CategoryResponse {
  id: number
  name: string
  description?: string | null
}

async function fetchJson<T>(
  path: string,
  token: string,
  errorMessage: string,
): Promise<T> {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not configured")
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`${errorMessage} (${response.status})`)
  }

  return response.json() as Promise<T>
}

async function getAllOrders(
  token: string,
): Promise<{ orders: AdminOrder[]; totalOrders: number }> {
  const firstPage = await fetchJson<PageResponse<AdminOrder>>(
    `/orders/admin?page=0&size=${PAGE_SIZE}`,
    token,
    "Failed to fetch admin orders",
  )

  const orders = [...firstPage.content]

  // Load the remaining pages in small batches so revenue remains exact without
  // sending an unbounded number of requests to the backend at once.
  for (let startPage = 1; startPage < firstPage.totalPages; startPage += 5) {
    const endPage = Math.min(startPage + 5, firstPage.totalPages)
    const pages = await Promise.all(
      Array.from({ length: endPage - startPage }, (_, index) => {
        const page = startPage + index
        return fetchJson<PageResponse<AdminOrder>>(
          `/orders/admin?page=${page}&size=${PAGE_SIZE}`,
          token,
          `Failed to fetch admin orders page ${page + 1}`,
        )
      }),
    )

    orders.push(...pages.flatMap((page) => page.content))
  }

  return { orders, totalOrders: firstPage.totalContents }
}

function buildRevenueSeries(orders: AdminOrder[]): AdminRevenuePoint[] {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const firstDay = new Date(today)
  firstDay.setUTCDate(firstDay.getUTCDate() - (CHART_DAYS - 1))

  const points = new Map<string, AdminRevenuePoint>()

  for (let index = 0; index < CHART_DAYS; index += 1) {
    const date = new Date(firstDay)
    date.setUTCDate(firstDay.getUTCDate() + index)
    const key = date.toISOString().slice(0, 10)
    points.set(key, { date: key, revenue: 0, orders: 0 })
  }

  for (const order of orders) {
    const key = new Date(order.createdAt).toISOString().slice(0, 10)
    const point = points.get(key)

    if (!point) {
      continue
    }

    point.orders += 1
    if (order.status !== "CANCELLED") {
      point.revenue += Number(order.totalAmount)
    }
  }

  return Array.from(points.values())
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const token = (await cookies()).get("access_token")?.value

  if (!token) {
    throw new Error("Admin access token is missing")
  }

  const [orderResult, productPage, categories] = await Promise.all([
    getAllOrders(token),
    fetchJson<PageResponse<Product>>(
      "/products?page=0&size=1",
      token,
      "Failed to fetch product totals",
    ),
    fetchJson<CategoryResponse[]>(
      "/categories",
      token,
      "Failed to fetch category totals",
    ),
  ])

  const { orders, totalOrders } = orderResult
  const activeOrders = orders.filter((order) => order.status !== "CANCELLED")

  return {
    metrics: {
      totalRevenue: activeOrders.reduce(
        (total, order) => total + Number(order.totalAmount),
        0,
      ),
      totalOrders,
      totalProducts: productPage.totalContents,
      totalCategories: categories.length,
      openOrders: orders.filter(
        (order) =>
          order.status === "PENDING" || order.status === "CONFIRMED",
      ).length,
      deliveredOrders: orders.filter((order) => order.status === "DELIVERED")
        .length,
      cancelledOrders: orders.filter((order) => order.status === "CANCELLED")
        .length,
    },
    revenue: buildRevenueSeries(orders),
    recentOrders: orders.slice(0, RECENT_ORDER_COUNT),
  }
}
