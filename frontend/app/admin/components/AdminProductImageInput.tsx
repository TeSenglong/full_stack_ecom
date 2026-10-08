"use client"

import { AdminImageInput } from "@/app/admin/components/AdminImageInput"
import { useAdminProductFormStatus } from "@/app/admin/components/AdminProductFormStatus"

export function AdminProductImageInput() {
  const { setImageProcessing } = useAdminProductFormStatus()

  return (
    <AdminImageInput
      label="Product image"
      previewAlt="Selected product preview"
      fallbackFileName="product"
      onProcessingChange={setImageProcessing}
    />
  )
}
