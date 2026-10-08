"use client"

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import {
  CircleCheckIcon,
  CircleXIcon,
  LoaderCircleIcon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MAX_OUTPUT_SIZE = 5 * 1024 * 1024
const MAX_SOURCE_SIZE = 25 * 1024 * 1024
const TARGET_DIMENSIONS = [1600, 1400, 1200, 1000]
const WEBP_QUALITIES = [0.82, 0.72, 0.62, 0.52]
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
])

type ImageStatus = "idle" | "compressing" | "ready" | "error"

interface AdminImageInputProps {
  label: string
  previewAlt: string
  fallbackFileName: string
  onProcessingChange: (processing: boolean) => void
  required?: boolean
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("The browser could not compress this image."))
          return
        }

        if (blob.type !== "image/webp") {
          reject(new Error("This browser does not support WebP compression."))
          return
        }

        resolve(blob)
      },
      "image/webp",
      quality,
    )
  })
}

async function compressImage(file: File, fallbackFileName: string) {
  const image = await createImageBitmap(file)
  let smallestBlob: Blob | null = null

  try {
    for (const maxDimension of TARGET_DIMENSIONS) {
      const scale = Math.min(
        1,
        maxDimension / image.width,
        maxDimension / image.height,
      )
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext("2d")
      if (!context) {
        throw new Error("The browser could not process this image.")
      }

      context.drawImage(image, 0, 0, width, height)

      for (const quality of WEBP_QUALITIES) {
        const blob = await canvasToWebp(canvas, quality)
        smallestBlob =
          !smallestBlob || blob.size < smallestBlob.size ? blob : smallestBlob

        if (blob.size <= MAX_OUTPUT_SIZE) {
          const baseName = file.name.replace(/\.[^.]+$/, "") || fallbackFileName
          return new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          })
        }
      }
    }
  } finally {
    image.close()
  }

  if (!smallestBlob) {
    throw new Error("The browser could not compress this image.")
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || fallbackFileName
  return new File([smallestBlob], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  })
}

export function AdminImageInput({
  label,
  previewAlt,
  fallbackFileName,
  onProcessingChange,
  required = true,
}: AdminImageInputProps) {
  const { pending } = useFormStatus()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<ImageStatus>("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function showError(input: HTMLInputElement, errorMessage: string) {
    input.value = ""
    setPreviewUrl(null)
    setStatus("error")
    setMessage(errorMessage)
  }

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    setMessage("")

    if (!file) {
      setPreviewUrl(null)
      setStatus("idle")
      return
    }

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      showError(input, "Choose a JPEG, PNG, or WebP image.")
      return
    }

    if (file.size <= MAX_OUTPUT_SIZE) {
      setPreviewUrl(URL.createObjectURL(file))
      setStatus("ready")
      setMessage(`${formatBytes(file.size)} image is ready to upload.`)
      return
    }

    if (file.size > MAX_SOURCE_SIZE) {
      showError(input, "Choose an image no larger than 25 MB before compression.")
      return
    }

    input.value = ""
    setStatus("compressing")
    setMessage(`Compressing ${formatBytes(file.size)} image...`)
    onProcessingChange(true)

    try {
      const compressedFile = await compressImage(file, fallbackFileName)

      if (compressedFile.size > MAX_OUTPUT_SIZE) {
        showError(
          input,
          "The compressed image is still larger than 5 MB. Choose a smaller image.",
        )
        return
      }

      const transfer = new DataTransfer()
      transfer.items.add(compressedFile)
      input.files = transfer.files

      setPreviewUrl(URL.createObjectURL(compressedFile))
      setStatus("ready")
      setMessage(
        `Compressed from ${formatBytes(file.size)} to ${formatBytes(compressedFile.size)}. Ready to upload.`,
      )
    } catch (error) {
      showError(
        input,
        error instanceof Error
          ? error.message
          : "The image could not be compressed.",
      )
    } finally {
      onProcessingChange(false)
    }
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <Label htmlFor="image">
        {label}
        {required && " *"}
      </Label>
      <Input
        id="image"
        name="image"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        disabled={pending || status === "compressing"}
        required={required}
      />
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, or WebP. Images over 5 MB are automatically compressed.
      </p>

      {status !== "idle" && (
        <div
          role={status === "error" ? "alert" : "status"}
          className={
            status === "compressing"
              ? "flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
              : status === "ready"
                ? "flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                : "flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          }
        >
          {status === "compressing" ? (
            <LoaderCircleIcon className="size-4 shrink-0 animate-spin" />
          ) : status === "ready" ? (
            <CircleCheckIcon className="size-4 shrink-0" />
          ) : (
            <CircleXIcon className="size-4 shrink-0" />
          )}
          <span>{message}</span>
        </div>
      )}

      {previewUrl && status === "ready" && (
        <img
          src={previewUrl}
          alt={previewAlt}
          className="aspect-square w-full max-w-64 rounded-lg border object-cover"
        />
      )}
    </div>
  )
}
