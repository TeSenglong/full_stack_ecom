import type { UserRole } from "@/app/(auth)/auth"

export function roleHomePath(role: UserRole) {
  if (role === "ADMIN") return "/admin"
  if (role === "STAFF") return "/staff"
  return "/account"
}

export function roleLabel(role: UserRole) {
  if (role === "ADMIN") return "Administrator"
  if (role === "STAFF") return "Staff"
  return "Customer"
}
