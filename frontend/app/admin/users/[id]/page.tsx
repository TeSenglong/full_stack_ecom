import { notFound, unstable_rethrow } from "next/navigation"

import { AdminUserDetails } from "@/app/admin/components/AdminUserDetails"
import { getAdminUserById } from "@/lib/api/admin-users"
import { requireAdmin } from "@/lib/auth/server"

export default async function AdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const currentAdmin = await requireAdmin()
  const { id } = await params

  if (!/^\d+$/.test(id) || Number(id) < 1) {
    notFound()
  }

  let user

  try {
    user = await getAdminUserById(id)
  } catch (error) {
    unstable_rethrow(error)
    if (error instanceof Error && error.message.includes("(404)")) {
      notFound()
    }
    throw error
  }

  return (
    <AdminUserDetails user={user} currentAdminId={currentAdmin.id} />
  )
}
