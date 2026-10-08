"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { useActionState, useState } from "react"
import {
  ArrowLeftIcon,
  ImageIcon,
  LayersIcon,
  LoaderCircleIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react"

import { AdminImageInput } from "@/app/admin/components/AdminImageInput"
import {
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryActionState,
} from "@/app/admin/categories/[id]/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/product"

const INITIAL_ACTION_STATE: CategoryActionState = {
  status: "idle",
  message: "",
}

function ActionMessage({ state }: { state: CategoryActionState }) {
  if (state.status === "idle") return null

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
      )}
    >
      {state.message}
    </p>
  )
}

export function AdminCategoryDetails({ category }: { category: Category }) {
  const [imageProcessing, setImageProcessing] = useState(false)
  const updateAction = updateCategoryAction.bind(null, String(category.id))
  const deleteAction = deleteCategoryAction.bind(null, String(category.id))
  const [updateState, submitUpdate, updatePending] = useActionState(
    updateAction,
    INITIAL_ACTION_STATE,
  )
  const [deleteState, submitDelete, deletePending] = useActionState(
    deleteAction,
    INITIAL_ACTION_STATE,
  )
  const categoryFormKey = JSON.stringify([
    category.id,
    category.name,
    category.description,
    category.imageUrl,
  ])

  return (
    <section className="space-y-6 px-4 py-6 lg:px-6">
      <nav aria-label="Breadcrumb">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" aria-hidden="true" />
          Back to categories
        </Link>
      </nav>

      <div className="border-b pb-6">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline">Category</Badge>
          <span className="font-mono text-xs text-muted-foreground">
            ID {category.id}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {category.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Update how this category is presented and organized in the catalog.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form key={categoryFormKey} action={submitUpdate}>
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Category information</CardTitle>
              <CardDescription>
                Change the category name, description, or replace its image.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Category name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={category.name}
                  maxLength={100}
                  disabled={updatePending}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={category.description ?? ""}
                  maxLength={1000}
                  rows={7}
                  disabled={updatePending}
                  className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <AdminImageInput
                label="Replace category image"
                previewAlt="Selected replacement category image"
                fallbackFileName="category"
                onProcessingChange={setImageProcessing}
                required={false}
              />

              <ActionMessage state={updateState} />
            </CardContent>

            <CardFooter className="justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={updatePending || imageProcessing}
              >
                {updatePending || imageProcessing ? (
                  <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
                ) : (
                  <SaveIcon aria-hidden="true" />
                )}
                {imageProcessing
                  ? "Preparing image..."
                  : updatePending
                    ? "Saving..."
                    : "Save changes"}
              </Button>
            </CardFooter>
          </Card>
        </form>

        <aside className="space-y-6">
          <Card>
            <div className="mx-4 overflow-hidden rounded-lg border bg-muted/30">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-2 size-8" aria-hidden="true" />
                    <p className="text-sm">No category image</p>
                  </div>
                </div>
              )}
            </div>
            <CardContent>
              <div className="flex items-start gap-3">
                <LayersIcon
                  className="mt-0.5 size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {category.description || "No description provided."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ring-destructive/25">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>
                Delete this category permanently. Categories assigned to products
                must be removed from those products first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form
                action={submitDelete}
                onSubmit={(event) => {
                  if (
                    !window.confirm(
                      `Delete "${category.name}"? This action cannot be undone.`,
                    )
                  ) {
                    event.preventDefault()
                  }
                }}
              >
                <Button
                  type="submit"
                  variant="destructive"
                  className="w-full"
                  disabled={deletePending}
                >
                  {deletePending ? (
                    <LoaderCircleIcon className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2Icon aria-hidden="true" />
                  )}
                  {deletePending ? "Deleting..." : "Delete category"}
                </Button>
              </form>
              <ActionMessage state={deleteState} />
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  )
}
