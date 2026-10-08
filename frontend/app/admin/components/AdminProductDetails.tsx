"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { useActionState } from "react"
import {
  ArrowLeftIcon,
  BadgeDollarSignIcon,
  BoxesIcon,
  ExternalLinkIcon,
  ImageIcon,
  LoaderCircleIcon,
  PackageCheckIcon,
  SaveIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react"

import {
  deleteProductAction,
  updateProductAction,
  type ProductActionState,
} from "@/app/admin/products/[id]/actions"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Category, Product } from "@/types/product"

const INITIAL_ACTION_STATE: ProductActionState = {
  status: "idle",
  message: "",
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function getCategory(product: Product) {
  return typeof product.category === "string"
    ? { id: undefined, name: product.category }
    : product.category
}

function getStockPresentation(stockQuantity: number) {
  if (stockQuantity === 0) {
    return {
      label: "Out of stock",
      detail: "Customers cannot purchase this item.",
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
    }
  }

  if (stockQuantity <= 5) {
    return {
      label: "Low stock",
      detail: "Replenishment should be reviewed soon.",
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    }
  }

  return {
    label: "In stock",
    detail: "Inventory is currently available for sale.",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  }
}

function ActionMessage({ state }: { state: ProductActionState }) {
  if (state.status === "idle") {
    return null
  }

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-800",
      )}
    >
      {state.message}
    </p>
  )
}

export function AdminProductDetails({
  product,
  categories,
}: {
  product: Product
  categories: Category[]
}) {
  const category = getCategory(product)
  const stock = getStockPresentation(product.stockQuantity)
  const effectivePrice = product.discountPrice ?? product.price
  const productFormKey = JSON.stringify([
    product.id,
    product.name,
    product.price,
    product.discountPrice,
    product.stockQuantity,
    category?.id,
    product.brand,
    product.releaseDate,
    product.imageUrl,
    product.description,
  ])
  const updateAction = updateProductAction.bind(null, String(product.id))
  const deleteAction = deleteProductAction.bind(null, String(product.id))
  const [updateState, submitUpdate, updatePending] = useActionState(
    updateAction,
    INITIAL_ACTION_STATE,
  )
  const [deleteState, submitDelete, deletePending] = useActionState(
    deleteAction,
    INITIAL_ACTION_STATE,
  )

  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <nav aria-label="Breadcrumb">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Back to products
        </Link>
      </nav>

      <div className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={stock.className}>
              {stock.label}
            </Badge>
            <Badge variant="outline">{category?.name ?? "Uncategorized"}</Badge>
          </div>
          <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            SKU {product.sku} · Product ID {product.id}
          </p>
        </div>

        <Link
          href={`/products/${product.id}`}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          <ExternalLinkIcon aria-hidden="true" />
          View storefront
        </Link>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form key={productFormKey} action={submitUpdate}>
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Product information</CardTitle>
              <CardDescription>
                Update the catalog details customers see and the inventory used at checkout.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Product name *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={product.name}
                    maxLength={200}
                    disabled={updatePending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Regular price *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue={product.price}
                    min="0"
                    step="0.01"
                    disabled={updatePending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount price</Label>
                  <Input
                    id="discountPrice"
                    name="discountPrice"
                    type="number"
                    defaultValue={product.discountPrice ?? ""}
                    min="0"
                    step="0.01"
                    disabled={updatePending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty when the product is not on sale.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Available stock *</Label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    defaultValue={product.stockQuantity}
                    min="0"
                    step="1"
                    disabled={updatePending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    defaultValue={category?.id}
                    disabled={updatePending}
                    required
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>
                      Select a category
                    </option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    name="brand"
                    defaultValue={product.brand ?? ""}
                    maxLength={120}
                    disabled={updatePending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Release date</Label>
                  <Input
                    id="releaseDate"
                    name="releaseDate"
                    type="date"
                    lang="en-GB"
                    defaultValue={product.releaseDate ?? ""}
                    disabled={updatePending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Select the complete date (DD/MM/YYYY).
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    defaultValue={product.imageUrl ?? ""}
                    maxLength={2048}
                    placeholder="https://example.com/product.jpg"
                    disabled={updatePending}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={product.description ?? ""}
                    maxLength={4000}
                    rows={8}
                    disabled={updatePending}
                    className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <ActionMessage state={updateState} />
            </CardContent>

            <CardFooter className="justify-end gap-3">
              <Button type="submit" size="lg" disabled={updatePending}>
                {updatePending ? (
                  <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
                ) : (
                  <SaveIcon aria-hidden="true" />
                )}
                {updatePending ? "Saving…" : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <aside className="space-y-6">
          <Card>
            <div className="mx-4 overflow-hidden rounded-lg border bg-muted/30">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-2 size-8" aria-hidden="true" />
                    <p className="text-sm">No product image</p>
                  </div>
                </div>
              )}
            </div>
            <CardContent>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Storefront preview
              </p>
              <p className="mt-1 line-clamp-2 font-medium">{product.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Catalog snapshot</CardTitle>
              <CardDescription>Current saved product values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <BoxesIcon className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">{product.stockQuantity} units</p>
                  <p className="text-xs text-muted-foreground">{stock.detail}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <BadgeDollarSignIcon className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">{currencyFormatter.format(effectivePrice)}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.discountPrice != null
                      ? `Discounted from ${currencyFormatter.format(product.price)}`
                      : "Regular selling price"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <TagIcon className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-medium">{category?.name ?? "Uncategorized"}</p>
                  <p className="text-xs text-muted-foreground">Catalog category</p>
                </div>
              </div>
              <div className="flex gap-3">
                <PackageCheckIcon className="mt-0.5 size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="font-mono text-xs font-medium">{product.sku}</p>
                  <p className="text-xs text-muted-foreground">Immutable product SKU</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ring-destructive/25">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>
                Permanently remove this product from the catalog. Products referenced by existing records may be protected from deletion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form
                action={submitDelete}
                onSubmit={(event) => {
                  if (
                    !window.confirm(
                      `Delete “${product.name}”? This action cannot be undone.`,
                    )
                  ) {
                    event.preventDefault()
                  }
                }}
              >
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full"
                  disabled={deletePending}
                >
                  {deletePending ? (
                    <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2Icon aria-hidden="true" />
                  )}
                  {deletePending ? "Deleting…" : "Delete product"}
                </Button>
              </form>
              <ActionMessage state={deleteState} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
