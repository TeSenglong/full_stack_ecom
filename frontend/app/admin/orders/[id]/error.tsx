"use client"

import Link from "next/link"

import { Button, buttonVariants } from "@/components/ui/button"

export default function AdminOrderError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <p className="text-lg font-semibold">Couldn&apos;t load this order</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The order may be unavailable, or the backend could not be reached.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/admin/orders"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to orders
          </Link>
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
