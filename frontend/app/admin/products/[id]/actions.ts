"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { deleteProduct, updateProduct } from "@/lib/api/products"
import { requireAdmin } from "@/lib/auth/server"
import { isValidIsoDate } from "@/lib/date"
import type { NewProduct } from "@/types/product"

export interface ProductActionState {
  status: "idle" | "success" | "error"
  message: string
}

function requiredText(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim()
}

function optionalText(formData: FormData, name: string) {
  const value = requiredText(formData, name)
  return value || undefined
}

function requiredNumber(formData: FormData, name: string) {
  const value = requiredText(formData, name)
  return value === "" ? Number.NaN : Number(value)
}

function optionalNumber(formData: FormData, name: string) {
  const value = requiredText(formData, name)
  return value === "" ? undefined : Number(value)
}

function validProductId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0
}

function validateProduct(product: NewProduct): string | null {
  if (!product.name || product.name.length > 200) {
    return "Product name is required and must be 200 characters or fewer."
  }

  if (product.description && product.description.length > 4_000) {
    return "Description must be 4,000 characters or fewer."
  }

  if (!Number.isFinite(product.price) || product.price < 0) {
    return "Price must be zero or greater."
  }

  if (
    product.discountPrice != null &&
    (!Number.isFinite(product.discountPrice) ||
      product.discountPrice < 0 ||
      product.discountPrice > product.price)
  ) {
    return "Discount price must be between zero and the regular price."
  }

  if (!Number.isInteger(product.stockQuantity) || product.stockQuantity < 0) {
    return "Stock quantity must be a whole number of zero or greater."
  }

  if (!Number.isInteger(product.categoryId) || product.categoryId < 1) {
    return "Select a valid category."
  }

  if (product.brand && product.brand.length > 120) {
    return "Brand must be 120 characters or fewer."
  }

  if (!isValidIsoDate(product.releaseDate)) {
    return "Select a valid release date."
  }

  if (product.imageUrl) {
    try {
      const url = new URL(product.imageUrl)
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "Image URL must use HTTP or HTTPS."
      }
    } catch {
      return "Enter a valid image URL."
    }
  }

  return null
}

function revalidateProductViews(productId: string) {
  revalidatePath("/")
  revalidatePath("/products")
  revalidatePath(`/products/${productId}`)
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
}

export async function updateProductAction(
  productId: string,
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  await requireAdmin()

  if (!validProductId(productId)) {
    return { status: "error", message: "Invalid product identifier." }
  }

  const product: NewProduct = {
    name: requiredText(formData, "name"),
    description: optionalText(formData, "description"),
    price: requiredNumber(formData, "price"),
    discountPrice: optionalNumber(formData, "discountPrice"),
    stockQuantity: requiredNumber(formData, "stockQuantity"),
    imageUrl: optionalText(formData, "imageUrl"),
    brand: optionalText(formData, "brand"),
    releaseDate: optionalText(formData, "releaseDate"),
    categoryId: requiredNumber(formData, "categoryId"),
  }

  const validationError = validateProduct(product)
  if (validationError) {
    return { status: "error", message: validationError }
  }

  try {
    await updateProduct(productId, product)
    revalidateProductViews(productId)
    return { status: "success", message: "Product changes saved." }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to update this product.",
    }
  }
}

export async function deleteProductAction(
  productId: string,
  _previousState: ProductActionState,
  _formData: FormData,
): Promise<ProductActionState> {
  void _previousState
  void _formData

  await requireAdmin()

  if (!validProductId(productId)) {
    return { status: "error", message: "Invalid product identifier." }
  }

  try {
    await deleteProduct(productId)
    revalidateProductViews(productId)
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to delete this product.",
    }
  }

  redirect("/admin/products")
}
