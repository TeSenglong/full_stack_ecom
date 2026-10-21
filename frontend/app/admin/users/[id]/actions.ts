"use server"

import { revalidatePath } from "next/cache"

import {
  updateAdminUserEnabled,
  updateAdminUserRole,
} from "@/lib/api/admin-users"
import { requireAdmin } from "@/lib/auth/server"
import type { AdminUserRole } from "@/types/admin"

export interface AdminUserActionState {
  status: "idle" | "success" | "error"
  message: string
}

const USER_ROLES = new Set<AdminUserRole>(["USER", "STAFF", "ADMIN"])

function validUserId(userId: string) {
  return /^\d+$/.test(userId) && Number(userId) > 0
}

function revalidateUserPages(userId: string) {
  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${userId}`)
}

export async function updateAdminUserRoleAction(
  userId: string,
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  await requireAdmin()

  if (!validUserId(userId)) {
    return { status: "error", message: "Invalid user identifier." }
  }

  const role = String(formData.get("role") ?? "") as AdminUserRole

  if (!USER_ROLES.has(role)) {
    return { status: "error", message: "Select a valid user role." }
  }

  try {
    await updateAdminUserRole(userId, role)
    revalidateUserPages(userId)
    return {
      status: "success",
      message: `User role changed to ${role.toLowerCase()}.`,
    }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Unable to change user role.",
    }
  }
}

export async function updateAdminUserEnabledAction(
  userId: string,
  _previousState: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  await requireAdmin()

  if (!validUserId(userId)) {
    return { status: "error", message: "Invalid user identifier." }
  }

  const enabled = String(formData.get("enabled") ?? "")

  if (enabled !== "true" && enabled !== "false") {
    return { status: "error", message: "Select a valid account status." }
  }

  try {
    await updateAdminUserEnabled(userId, enabled === "true")
    revalidateUserPages(userId)
    return {
      status: "success",
      message: enabled === "true" ? "Account enabled." : "Account disabled.",
    }
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Unable to change account status.",
    }
  }
}
