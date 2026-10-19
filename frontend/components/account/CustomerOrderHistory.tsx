"use client";

import { ArrowRight, LoaderCircle, PackageOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getCustomerOrders } from "@/lib/api/orders";
import type { OrderPage } from "@/types/order";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const date = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-violet-100 text-violet-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function CustomerOrderHistory({
  pageSize = 10,
  compact = false,
}: {
  pageSize?: number;
  compact?: boolean;
}) {
  const [orderPage, setOrderPage] = useState<OrderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void getCustomerOrders(0, pageSize)
      .then((response) => {
        if (!cancelled) {
          setOrderPage(response);
          setError("");
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load your orders",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pageSize]);

  async function loadPage(page: number) {
    setLoading(true);
    setError("");

    try {
      setOrderPage(await getCustomerOrders(page, pageSize));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load your orders",
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading && !orderPage) {
    return (
      <div className="flex min-h-52 items-center justify-center text-on-surface-variant">
        <LoaderCircle className="mr-2 size-5 animate-spin" />
        Loading your orders...
      </div>
    );
  }

  if (error && !orderPage) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
        <button
          type="button"
          onClick={() => void loadPage(0)}
          className="mt-4 cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!orderPage || orderPage.content.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/20 px-6 py-14 text-center">
        <PackageOpen className="mx-auto size-10 text-on-surface-variant" />
        <h3 className="mt-4 font-serif text-2xl font-semibold text-primary">
          No orders yet
        </h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          Your completed checkouts will appear here.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
        >
          Explore products
          <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/70 backdrop-blur-[1px]">
          <LoaderCircle className="size-6 animate-spin text-primary" />
        </div>
      )}

      <div className="divide-y divide-primary/10">
        {orderPage.content.map((order) => {
          const itemCount = order.items.reduce(
            (total, item) => total + item.quantity,
            0,
          );

          return (
            <article
              key={order.id}
              className="grid gap-5 py-6 first:pt-0 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-semibold text-primary">
                    {order.orderNumber}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[order.status] ?? "bg-surface-high text-primary"}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {date.format(new Date(order.createdAt))} · {itemCount}{" "}
                  {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="flex items-center justify-between gap-5 sm:justify-end">
                <strong className="text-primary">
                  {currency.format(order.totalAmount)}
                </strong>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary/15 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-high"
                >
                  View
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {!compact && orderPage.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-5">
          <p className="text-sm text-on-surface-variant">
            Page {orderPage.page + 1} of {orderPage.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadPage(orderPage.page - 1)}
              disabled={orderPage.first || loading}
              className="cursor-pointer rounded-md border border-primary/15 px-3 py-2 text-sm text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => void loadPage(orderPage.page + 1)}
              disabled={orderPage.last || loading}
              className="cursor-pointer rounded-md border border-primary/15 px-3 py-2 text-sm text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
