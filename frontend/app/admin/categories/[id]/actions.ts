"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  deleteCategory,
  getCategoryById,
  updateCategory,
  updateCategoryWithImage,
} from "@/lib/api/categories"
import { requireAdmin } from "@/lib/auth/server"
import type { NewCategory } from "@/types/product"

export interface CategoryActionState {
  status: "idle" | "success" | "error"
  message: string
}

function validCategoryId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0
}

function validateCategory(category: NewCategory) {
  if (!category.name || category.name.length > 100) {
    return "Category name is required and must be 100 characters or fewer."
  }

  if (category.description && category.description.length > 1_000) {
    return "Description must be 1,000 characters or fewer."
  }

  return null
}

function validateOptionalImage(image: FormDataEntryValue | null) {
  if (!(image instanceof File) || image.size === 0) {
    return null
  }

  if (image.size > 5 * 1024 * 1024) {
    return "Category image must not exceed 5 MB."
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
    return "Category image must be JPEG, PNG, or WebP."
  }

  return null
}

function revalidateCategoryViews(categoryId: string) {
  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath("/admin")
  revalidatePath("/admin/categories")
  revalidatePath(`/admin/categories/${categoryId}`)
  revalidatePath("/admin/products")
}

export async function updateCategoryAction(
  categoryId: string,
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdmin()

  if (!validCategoryId(categoryId)) {
    return { status: "error", message: "Invalid category identifier." }
  }

  const description = String(formData.get("description") ?? "").trim()
  const category: NewCategory = {
    name: String(formData.get("name") ?? "").trim(),
    description: description || undefined,
  }
  const image = formData.get("image")
  const validationError = validateCategory(category) ?? validateOptionalImage(image)

  if (validationError) {
    return { status: "error", message: validationError }
  }

  try {
    if (image instanceof File && image.size > 0) {
      await updateCategoryWithImage(categoryId, category, image)
    } else {
      const currentCategory = await getCategoryById(categoryId)
      await updateCategory(categoryId, {
        ...category,
        imageUrl: currentCategory.imageUrl ?? undefined,
      })
    }

    revalidateCategoryViews(categoryId)
    return { status: "success", message: "Category changes saved." }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to update this category.",
    }
  }
}

export async function deleteCategoryAction(
  categoryId: string,
  _previousState: CategoryActionState,
  _formData: FormData,
): Promise<CategoryActionState> {
  void _previousState
  void _formData

  await requireAdmin()

  if (!validCategoryId(categoryId)) {
    return { status: "error", message: "Invalid category identifier." }
  }

  try {
    await deleteCategory(categoryId)
    revalidateCategoryViews(categoryId)
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to delete this category.",
    }
  }

  redirect("/admin/categories")
}
