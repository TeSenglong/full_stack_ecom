import "server-only"

import { cookies } from "next/headers"

import type {
  AdminUser,
  AdminUserPage,
  AdminUserRole,
} from "@/types/admin"

const BACKEND_URL = process.env.BACKEND_URL

async function adminUserRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
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
      data?.message ??
      data?.error ??
      `Admin user request failed (${response.status})`
    throw new Error(`${message} (${response.status})`)
  }

  return response.json() as Promise<T>
}

export function getAdminUsers({
  page = 0,
  size = 20,
  role,
  enabled,
  query,
}: {
  page?: number
  size?: number
  role?: AdminUserRole
  enabled?: boolean
  query?: string
} = {}) {
  const searchParams = new URLSearchParams({
    page: String(page),
    size: String(size),
  })

  if (role) {
    searchParams.set("role", role)
  }

  if (typeof enabled === "boolean") {
    searchParams.set("enabled", String(enabled))
  }

  if (query) {
    searchParams.set("query", query)
  }

  return adminUserRequest<AdminUserPage>(`/admin/users?${searchParams}`)
}

export function getAdminUserById(userId: string | number) {
  return adminUserRequest<AdminUser>(
    `/admin/users/${encodeURIComponent(userId)}`,
  )
}

export function updateAdminUserRole(
  userId: string | number,
  role: AdminUserRole,
) {
  return adminUserRequest<AdminUser>(
    `/admin/users/${encodeURIComponent(userId)}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
  )
}

export function updateAdminUserEnabled(
  userId: string | number,
  enabled: boolean,
) {
  return adminUserRequest<AdminUser>(
    `/admin/users/${encodeURIComponent(userId)}/enabled`,
    {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    },
  )
}
