import { AdminCategoryTable } from "@/app/admin/components/AdminCategoryTable"
import { getCategories } from "@/lib/api/categories"
import { requireAdmin } from "@/lib/auth/server"

export default async function AdminCategoriesPage() {
  await requireAdmin()
  const categories = await getCategories()

  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Administration
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Category management</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Organize the storefront catalog and maintain product categories.
        </p>
      </div>

      <AdminCategoryTable categories={categories} />
    </section>
  )
}
