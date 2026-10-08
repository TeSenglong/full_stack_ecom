import Link from "next/link"
import { PlusIcon } from "lucide-react"

/* eslint-disable @next/next/no-img-element */

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
import type { Category } from "@/types/product"

const numberFormatter = new Intl.NumberFormat("en-US")

export function AdminCategoryTable({
  categories,
}: {
  categories: Category[]
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            {numberFormatter.format(categories.length)} categor
            {categories.length === 1 ? "y" : "ies"} in the catalog
          </CardDescription>
        </div>
        <CardAction>
          <Link
            href="/admin/categories/new"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <PlusIcon aria-hidden="true" />
            Add Category
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">ID</TableHead>
              <TableHead className="pr-4 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-40 text-center text-muted-foreground"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="pl-4 font-medium">
                    <div className="flex items-center gap-3">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt=""
                          className="size-10 shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div
                          className="size-10 shrink-0 rounded-md bg-muted"
                          aria-hidden="true"
                        />
                      )}
                      <span>{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-2xl whitespace-normal text-muted-foreground">
                    {category.description || "No description"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {category.id}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
