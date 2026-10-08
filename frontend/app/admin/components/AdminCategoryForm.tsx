"use client"

import Link from "next/link"
import { useActionState, useState } from "react"
import { LoaderCircleIcon } from "lucide-react"

import { AdminImageInput } from "@/app/admin/components/AdminImageInput"
import {
  createCategoryAction,
  type CreateCategoryState,
} from "@/app/admin/categories/new/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const INITIAL_CREATE_CATEGORY_STATE: CreateCategoryState = {
  status: "idle",
  message: "",
}

export function AdminCategoryForm() {
  const [imageProcessing, setImageProcessing] = useState(false)
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
    INITIAL_CREATE_CATEGORY_STATE,
  )

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Category name *</Label>
        <Input
          id="name"
          name="name"
          maxLength={100}
          disabled={pending}
          required
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          maxLength={1000}
          rows={5}
          disabled={pending}
          className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <AdminImageInput
        label="Category image"
        previewAlt="Selected category preview"
        fallbackFileName="category"
        onProcessingChange={setImageProcessing}
      />

      {state.status === "error" && <FieldError>{state.message}</FieldError>}

      <div className="flex flex-wrap justify-end gap-3 border-t pt-6">
        <Link
          href="/admin/categories"
          className={buttonVariants({ variant: "outline" })}
          aria-disabled={pending || imageProcessing}
          tabIndex={pending || imageProcessing ? -1 : undefined}
        >
          Cancel
        </Link>
        <Button type="submit" disabled={pending || imageProcessing}>
          {(pending || imageProcessing) && (
            <LoaderCircleIcon className="animate-spin" />
          )}
          {imageProcessing
            ? "Preparing image..."
            : pending
              ? "Creating category..."
              : "Create category"}
        </Button>
      </div>
    </form>
  )
}
