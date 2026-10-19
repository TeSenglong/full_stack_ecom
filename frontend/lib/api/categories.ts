import "server-only"

import { cookies } from "next/headers"

import { getBackendUrl } from "@/lib/api/backend-url"
import type { Category, NewCategory } from "@/types/product"

const API_TIMEOUT_MS = 5_000
const CATEGORY_LIST_TIMEOUT_MS = 90_000

function getCategoriesUrl() {
  return `${getBackendUrl()}/categories`
}

async function getErrorMessage(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)
  return data?.message ?? data?.error ?? `${fallback} (${response.status})`
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(getCategoriesUrl(), {
    cache: "no-store",
    signal: AbortSignal.timeout(CATEGORY_LIST_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch categories (${response.status})`)
  }

  return response.json() as Promise<Category[]>
}

export async function getCategoryById(id: string): Promise<Category> {
  const response = await fetch(
    `${getCategoriesUrl()}/${encodeURIComponent(id)}`,
    {
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    },
  )

  if (response.status === 404) {
    throw new Error("Failed to fetch category (404)")
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to fetch category"))
  }

  return response.json() as Promise<Category>
}

export async function createCategory(
  category: NewCategory,
): Promise<Category> {
  const token = (await cookies()).get("access_token")?.value

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(getCategoriesUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  })

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to create category"))
  }

  return response.json() as Promise<Category>
}

export async function createCategoryWithImage(
  category: NewCategory,
  image: File,
): Promise<Category> {
  const token = (await cookies()).get("access_token")?.value

  if (!token) {
    throw new Error("Authentication required")
  }

  const formData = new FormData()
  formData.set(
    "category",
    new Blob([JSON.stringify(category)], { type: "application/json" }),
  )
  formData.set("file", image, image.name)

  const response = await fetch(`${getCategoriesUrl()}/with-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  })

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to create category with image"),
    )
  }

  return response.json() as Promise<Category>
}

export async function updateCategory(
  id: string,
  category: NewCategory,
): Promise<Category> {
  const token = (await cookies()).get("access_token")?.value

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(
    `${getCategoriesUrl()}/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(category),
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    },
  )

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to update category"))
  }

  return response.json() as Promise<Category>
}

export async function updateCategoryWithImage(
  id: string,
  category: NewCategory,
  image: File,
): Promise<Category> {
  const token = (await cookies()).get("access_token")?.value

  if (!token) {
    throw new Error("Authentication required")
  }

  const formData = new FormData()
  formData.set(
    "category",
    new Blob([JSON.stringify(category)], { type: "application/json" }),
  )
  formData.set("file", image, image.name)

  const response = await fetch(
    `${getCategoriesUrl()}/${encodeURIComponent(id)}/with-image`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    },
  )

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response, "Failed to update category image"),
    )
  }

  return response.json() as Promise<Category>
}

export async function deleteCategory(id: string): Promise<void> {
  const token = (await cookies()).get("access_token")?.value

  if (!token) {
    throw new Error("Authentication required")
  }

  const response = await fetch(
    `${getCategoriesUrl()}/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    },
  )

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Failed to delete category"))
  }
}
