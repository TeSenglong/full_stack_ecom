import { notFound, unstable_rethrow } from "next/navigation"
import { AdminProductDetails } from "@/app/admin/components/AdminProductDetails"
import { getCategories } from "@/lib/api/categories"
import { getProductById } from "@/lib/api/products"
import { requireStaff } from "@/lib/auth/server"

export default async function StaffProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff()

  const { id } = await params

  let product
  let categories

  try {
    [product, categories] = await Promise.all([
      getProductById(id),
      getCategories(),
    ])
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof Error && error.message.includes("(404)")) {
      notFound()
    }
    throw error
  }

  return (
    <AdminProductDetails
      product={product}
      categories={categories}
      readOnly={true}
      backHref="/staff/products"
    />
  )
}
