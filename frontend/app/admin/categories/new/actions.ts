"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createCategoryWithImage } from "@/lib/api/categories"
import { requireAdmin } from "@/lib/auth/server"
import type { NewCategory } from "@/types/product"

export interface CreateCategoryState {
  status: "idle" | "error"
  message: string
}

export async function createCategoryAction(
  _previousState: CreateCategoryState,
  formData: FormData,
): Promise<CreateCategoryState> {
  await requireAdmin()

  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const image = formData.get("image")

  if (!name || name.length > 100) {
    return {
      status: "error",
      message: "Category name is required and must be 100 characters or fewer.",
    }
  }

  if (description.length > 1_000) {
    return {
      status: "error",
      message: "Description must be 1,000 characters or fewer.",
    }
  }

  if (!(image instanceof File) || image.size === 0) {
    return {
      status: "error",
      message: "Category image is required.",
    }
  }

  if (image.size > 5 * 1024 * 1024) {
    return {
      status: "error",
      message: "Category image must not exceed 5 MB.",
    }
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
    return {
      status: "error",
      message: "Category image must be JPEG, PNG, or WebP.",
    }
  }

  const category: NewCategory = {
    name,
    description: description || undefined,
  }

  try {
    await createCategoryWithImage(category, image)
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to create the category.",
    }
  }

  revalidatePath("/admin")
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  redirect("/admin/categories")
}
