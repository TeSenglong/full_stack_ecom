import { AdminProductTable } from "@/app/admin/components/AdminProductTable"
import { getProductPage } from "@/lib/api/products"
import { requireStaff } from "@/lib/auth/server"

const PRODUCTS_PER_PAGE = 20

function parsePage(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value
  const page = Number.parseInt(rawValue ?? "1", 10)

  return Number.isFinite(page) && page > 0 ? page : 1
}

export default async function StaffProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>
}) {
  await requireStaff()

  const requestedPage = parsePage((await searchParams).page)
  const productPage = await getProductPage(
    requestedPage - 1,
    PRODUCTS_PER_PAGE,
  )

  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Staff workspace
        </p>
        <h2 className="mt-2 text-2xl font-semibold">Product catalog</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          View products, inventory levels, SKUs, and pricing across the store.
        </p>
      </div>

      <AdminProductTable
        productPage={productPage}
        readOnly={true}
        basePath="/staff/products"
      />
    </section>
  )
}
