import "server-only"

import { cookies } from "next/headers"

import type {
  AdminOrder,
  AdminOrderPage,
  AdminOrderStatus,
} from "@/types/admin"

const BACKEND_URL = process.env.BACKEND_URL

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not configured")
  }

  const token = (await cookies()).get("access_token")?.value

  if (!token) {
    throw new Error("Admin access token is missing")
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const message =
      data?.message ?? data?.error ?? `Admin order request failed (${response.status})`
    throw new Error(`${message} (${response.status})`)
  }

  return response.json() as Promise<T>
}

export function getAdminOrders({
  page = 0,
  size = 20,
  status,
  query,
}: {
  page?: number
  size?: number
  status?: AdminOrderStatus
  query?: string
} = {}) {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  })

  if (status) {
    searchParams.set("status", status)
  }

  if (query) {
    searchParams.set("query", query)
  }

  return adminRequest<AdminOrderPage>(`/orders/admin?${searchParams}`)
}

export function getAdminOrderById(orderId: string | number) {
  return adminRequest<AdminOrder>(
    `/orders/admin/${encodeURIComponent(orderId)}`,
  )
}

export function updateAdminOrderStatus(
  orderId: string | number,
  status: AdminOrderStatus,
) {
  return adminRequest<AdminOrder>(
    `/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  )
}
