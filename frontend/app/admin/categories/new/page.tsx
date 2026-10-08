import type { Metadata } from "next"

import { AdminCategoryForm } from "@/app/admin/components/AdminCategoryForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireAdmin } from "@/lib/auth/server"

export const metadata: Metadata = {
  title: "Add Category | Admin",
  description: "Add a category to the store catalog.",
}

export default async function NewCategoryPage() {
  await requireAdmin()

  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Category management
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Add category</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Create a category that can be assigned to products.
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader className="border-b">
          <CardTitle>Category information</CardTitle>
          <CardDescription>
            Category names must be unique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminCategoryForm />
        </CardContent>
      </Card>
    </section>
  )
}
