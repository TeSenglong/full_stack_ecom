"use client"

import { useFormStatus } from "react-dom"
import { LoaderCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAdminProductFormStatus } from "@/app/admin/components/AdminProductFormStatus"

export function AdminProductSubmitButton({
  disabled: externallyDisabled = false,
}: {
  disabled?: boolean
}) {
  const { pending } = useFormStatus()
  const { imageProcessing } = useAdminProductFormStatus()
  const disabled = externallyDisabled || pending || imageProcessing

  return (
    <Button type="submit" disabled={disabled} aria-disabled={disabled}>
      {disabled && <LoaderCircleIcon className="animate-spin" aria-hidden="true" />}
      {externallyDisabled
        ? "Create a category first"
        : imageProcessing
        ? "Preparing image..."
        : pending
          ? "Creating product..."
          : "Create product"}
    </Button>
  )
}
