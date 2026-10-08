"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 text-center shadow-sm">
        <p className="text-lg font-semibold">Couldn&apos;t load this product</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Check that the product API is available, then try loading the management page again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/admin/products"
            className={buttonVariants({ variant: "outline" })}
          >
            Back to products
          </Link>
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
