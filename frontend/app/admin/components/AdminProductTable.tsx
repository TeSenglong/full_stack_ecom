import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatProductReleaseDate } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { Product, ProductPage } from "@/types/product"
import Image from "next/image"

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const numberFormatter = new Intl.NumberFormat("en-US")

function categoryName(product: Product) {
  if (typeof product.category === "string") {
    return product.category
  }

  return product.category?.name ?? "Uncategorized"
}

function displayedPrice(product: Product) {
  return product.discountPrice ?? product.price
}

function stockBadge(product: Product) {
  if (product.stockQuantity === 0) {
    return {
      label: "Out of stock",
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
    }
  }

  if (product.stockQuantity <= 5) {
    return {
      label: `${product.stockQuantity} low stock`,
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    }
  }

  return {
    label: `${product.stockQuantity} in stock`,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  }
}

function pageHref(page: number) {
  return `/admin/products?page=${page}`
}

export function AdminProductTable({
  productPage,
}: {
  productPage: ProductPage
}) {
  const currentPage = productPage.page + 1

  return (
    <Card>
      <CardHeader className="border-b">
        <div>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            {numberFormatter.format(productPage.totalContents)} product
            {productPage.totalContents === 1 ? "" : "s"} in the catalog
          </CardDescription>
        </div>
        <CardAction>
          <Link
            href="/admin/products/newProduct"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <PlusIcon aria-hidden="true" />
            Add Product
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="pr-4 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productPage.content.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-40 text-center text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              productPage.content.map((product) => {
                const stock = stockBadge(product)
                const releaseDate = formatProductReleaseDate(product.releaseDate)

                return (
                  <TableRow key={product.id}>
                    <TableCell className="max-w-72 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate font-medium">
                            {product.name}
                          </div>

                          {releaseDate && (
                            <div className="text-xs text-muted-foreground">
                              Released {releaseDate}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs">
                      {product.sku}
                    </TableCell>
                    <TableCell>{categoryName(product)}</TableCell>
                    <TableCell>{product.brand || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={stock.className}>
                        {stock.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <div className="font-medium">
                        {currencyFormatter.format(displayedPrice(product))}
                      </div>
                      {product.discountPrice != null && (
                        <div className="text-xs text-muted-foreground line-through">
                          {currencyFormatter.format(product.price)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {productPage.totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {productPage.totalPages}
            </p>
            <div className="flex items-center gap-2">
              {productPage.first ? (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  Previous
                </span>
              ) : (
                <Link
                  href={pageHref(currentPage - 1)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Previous
                </Link>
              )}

              {productPage.last ? (
                <span
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  Next
                </span>
              ) : (
                <Link
                  href={pageHref(currentPage + 1)}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
