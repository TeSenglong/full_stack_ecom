"use client";

import {
  ArrowLeft,
  Check,
  LoaderCircle,
  MapPin,
  Package,
  Phone,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import ProgressiveImage from "@/components/products/ProgressiveImage";
import { getCustomerOrder } from "@/lib/api/orders";
import type { Order } from "@/types/order";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateTime = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const ORDER_STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function CustomerOrderDetails({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void getCustomerOrder(orderId)
      .then((response) => {
        if (!cancelled) {
          setOrder(response);
          setError("");
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load this order",
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
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center py-20 text-on-surface-variant">
        <LoaderCircle className="mr-2 size-5 animate-spin" />
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-96 items-center justify-center py-20 text-center">
        <div>
          <ReceiptText className="mx-auto size-12 text-primary" />
          <h1 className="mt-5 font-serif text-4xl font-semibold text-primary">
            Order unavailable
          </h1>
          <p className="mt-3 text-on-surface-variant">
            {error || "We couldn't find this order."}
          </p>
          <Link
            href="/account/orders"
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-on-primary"
          >
            <ArrowLeft className="size-4" />
            Back to your orders
          </Link>
        </div>
      </div>
    );
  }

  const activeStep = ORDER_STEPS.indexOf(order.status);

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to your orders
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-5 border-b border-primary/10 pb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Order details
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">
            {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Placed {dateTime.format(new Date(order.createdAt))}
          </p>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            order.status === "CANCELLED"
              ? "bg-red-100 text-red-800"
              : "bg-primary text-on-primary"
          }`}
        >
          {statusLabel(order.status)}
        </span>
      </div>

      {order.status === "CANCELLED" ? (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          This order was cancelled. Any reserved stock has been returned to the catalog.
        </div>
      ) : (
        <section className="mt-8 rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8">
          <h2 className="font-serif text-2xl font-semibold text-primary">
            Order progress
          </h2>
          <ol className="mt-7 grid grid-cols-4">
            {ORDER_STEPS.map((step, index) => {
              const complete = index <= activeStep;

              return (
                <li key={step} className="relative text-center">
                  {index > 0 && (
                    <span
                      className={`absolute right-1/2 top-4 h-0.5 w-full ${index <= activeStep ? "bg-primary" : "bg-primary/15"}`}
                    />
                  )}
                  <span
                    className={`relative z-10 mx-auto flex size-8 items-center justify-center rounded-full border ${complete ? "border-primary bg-primary text-on-primary" : "border-primary/20 bg-surface text-on-surface-variant"}`}
                  >
                    {complete ? <Check className="size-4" /> : index + 1}
                  </span>
                  <span className="mt-2 block text-[11px] font-medium text-primary sm:text-sm">
                    {statusLabel(step)}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8">
          <h2 className="font-serif text-2xl font-semibold text-primary">
            Items
          </h2>
          <div className="mt-6 divide-y divide-primary/10">
            {order.items.map((item) => (
              <article
                key={item.id}
                className="grid grid-cols-[72px_1fr_auto] gap-4 py-5 first:pt-0"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="aspect-square overflow-hidden rounded-md border border-primary/10 bg-surface-low"
                >
                  {item.productImageUrl ? (
                    <ProgressiveImage
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="h-full w-full"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      <Package className="size-5 text-on-surface-variant" />
                    </span>
                  )}
                </Link>
                <div className="min-w-0">
                  <Link
                    href={`/products/${item.productId}`}
                    className="line-clamp-2 font-medium text-primary hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    SKU {item.productSku} · Qty {item.quantity}
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {currency.format(item.price)} each
                  </p>
                </div>
                <strong className="text-right text-primary">
                  {currency.format(item.subtotal)}
                </strong>
              </article>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-primary/10 bg-surface-low p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-primary">
              Summary
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">Items</dt>
                <dd className="text-primary">
                  {order.items.reduce((total, item) => total + item.quantity, 0)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">Payment</dt>
                <dd className="text-right text-primary">{order.paymentMethod}</dd>
              </div>
            </dl>
            <div className="my-5 h-px bg-primary/10" />
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium text-primary">Order total</span>
              <strong className="text-2xl text-primary">
                {currency.format(order.totalAmount)}
              </strong>
            </div>
          </section>

          <section className="rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm">
            <h2 className="font-serif text-2xl font-semibold text-primary">
              Delivery
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" />
                <div>
                  <p className="font-medium text-primary">{order.recipientName}</p>
                  <p className="mt-1 whitespace-pre-line text-on-surface-variant">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-secondary" />
                <span className="text-on-surface-variant">
                  {order.recipientPhone}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <WalletCards className="size-4 shrink-0 text-secondary" />
                <span className="text-on-surface-variant">
                  {order.paymentMethod}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
