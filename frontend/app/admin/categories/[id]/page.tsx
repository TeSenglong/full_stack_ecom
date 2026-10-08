import { notFound, unstable_rethrow } from "next/navigation"

import { AdminCategoryDetails } from "@/app/admin/components/AdminCategoryDetails"
import { getCategoryById } from "@/lib/api/categories"
import { requireAdmin } from "@/lib/auth/server"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params

  if (!/^\d+$/.test(id) || Number(id) < 1) {
    notFound()
  }

  let category

  try {
    category = await getCategoryById(id)
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof Error && error.message.includes("(404)")) {
      notFound()
    }
    throw error
  }

  return <AdminCategoryDetails category={category} />
}
