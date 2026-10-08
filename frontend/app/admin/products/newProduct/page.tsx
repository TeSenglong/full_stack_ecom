import type { Metadata } from "next"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { AdminProductSubmitButton } from "@/app/admin/components/AdminProductSubmitButton"
import { AdminProductImageInput } from "@/app/admin/components/AdminProductImageInput"
import { AdminProductFormStatusProvider } from "@/app/admin/components/AdminProductFormStatus"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProductWithImage } from "@/lib/api/products"
import { getCategories } from "@/lib/api/categories"
import { requireAdmin } from "@/lib/auth/server"
import { isValidIsoDate } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { NewProduct } from "@/types/product"

export const metadata: Metadata = {
  title: "Add Product | Admin",
  description: "Add a product to the store catalog.",
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

async function createProductAction(formData: FormData) {
  "use server"

  await requireAdmin()

  const product: NewProduct = {
    name: requiredText(formData, "name"),
    description: optionalText(formData, "description"),
    price: requiredNumber(formData, "price"),
    discountPrice: optionalNumber(formData, "discountPrice"),
    stockQuantity: requiredNumber(formData, "stockQuantity"),
    brand: optionalText(formData, "brand"),
    releaseDate: optionalText(formData, "releaseDate"),
    categoryId: requiredNumber(formData, "categoryId"),
  }

  const image = formData.get("image")

  if (!(image instanceof File) || image.size === 0) {
    throw new Error("Product image is required")
  }

  if (image.size > 5 * 1024 * 1024) {
    throw new Error("Product image must not exceed 5 MB")
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
    throw new Error("Product image must be JPEG, PNG, or WebP")
  }

  if (!product.name) {
    throw new Error("Product name is required")
  }

  if (!Number.isFinite(product.price) || product.price < 0) {
    throw new Error("Price must be zero or greater")
  }

  if (
    product.discountPrice != null &&
    (!Number.isFinite(product.discountPrice) || product.discountPrice < 0)
  ) {
    throw new Error("Discount price must be zero or greater")
  }

  if (!Number.isInteger(product.stockQuantity) || product.stockQuantity < 0) {
    throw new Error("Stock quantity must be a whole number of zero or greater")
  }

  if (!Number.isInteger(product.categoryId) || product.categoryId < 1) {
    throw new Error("A valid category ID is required")
  }

  if (!isValidIsoDate(product.releaseDate)) {
    throw new Error("Select a valid release date")
  }

  await createProductWithImage(product, image)
  revalidatePath("/admin/products")
  redirect("/admin/products")
}

export default async function NewProductPage() {
  await requireAdmin()
  const categories = await getCategories()
  const hasCategories = categories.length > 0

  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Product management
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Add product</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Create a new item in your storefront catalog.
        </p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader className="border-b">
          <CardTitle>Product information</CardTitle>
          <CardDescription>
            Fields marked with an asterisk are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProductAction} className="space-y-6">
            <AdminProductFormStatusProvider>
              <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Product name *</Label>
                <Input id="name" name="name" maxLength={200} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount price</Label>
                <Input
                  id="discountPrice"
                  name="discountPrice"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock quantity *</Label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue=""
                  disabled={!hasCategories}
                  required
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>
                    {hasCategories
                      ? "Select a category"
                      : "No categories available"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {!hasCategories && (
                  <p className="text-xs text-muted-foreground">
                    <Link
                      href="/admin/categories/new"
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      Add a category
                    </Link>{" "}
                    before creating a product.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" name="brand" maxLength={120} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release date</Label>
                <Input
                  id="releaseDate"
                  name="releaseDate"
                  type="date"
                  lang="en-GB"
                />
                <p className="text-xs text-muted-foreground">
                  Select the complete date (DD/MM/YYYY).
                </p>
              </div>

              <AdminProductImageInput />

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  maxLength={4000}
                  rows={6}
                  className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t pt-6">
                <Link
                  href="/admin/products"
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Cancel
                </Link>
                <AdminProductSubmitButton disabled={!hasCategories} />
              </div>
            </AdminProductFormStatusProvider>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
