"use client";

import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  PackageCheck,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { useCustomerCart } from "@/components/cart/CustomerCartProvider";
import { useAuth } from "@/hooks/useAuth";
import { checkout } from "@/lib/api/orders";
import type { Order } from "@/types/order";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function CustomerCheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    cart,
    loading: cartLoading,
    loadError,
    refreshCart,
  } = useCustomerCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const order = await checkout({
        recipientName: String(formData.get("recipientName") ?? ""),
        recipientPhone: String(formData.get("recipientPhone") ?? ""),
        shippingAddress: String(formData.get("shippingAddress") ?? ""),
        paymentMethod: "Cash on delivery",
      });

      setCompletedOrder(order);
      await refreshCart().catch(() => undefined);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to complete your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || cartLoading) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-6xl px-5 py-14 md:px-8">
        <div className="h-10 w-52 animate-pulse rounded bg-surface-high" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="h-96 animate-pulse rounded-xl bg-surface-low" />
          <div className="h-80 animate-pulse rounded-xl bg-surface-low" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center px-5 py-20 text-center">
        <div>
          <LockKeyhole className="mx-auto size-12 text-primary" />
          <h1 className="mt-5 font-serif text-4xl font-semibold text-primary">
            Sign in to check out
          </h1>
          <p className="mt-3 text-on-surface-variant">
            Checkout is protected and connected to your customer account.
          </p>
          <Link
            href="/login?next=%2Fcheckout"
            className="mt-7 inline-flex rounded-md bg-primary px-7 py-3 font-medium text-on-primary"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center px-5 py-20 text-center">
        <div>
          <PackageCheck className="mx-auto size-12 text-primary" />
          <h1 className="mt-5 font-serif text-4xl font-semibold text-primary">
            We couldn&apos;t prepare checkout
          </h1>
          <p className="mt-3 text-on-surface-variant">{loadError}</p>
          <Link
            href="/cart"
            className="mt-7 inline-flex rounded-md bg-primary px-7 py-3 font-medium text-on-primary"
          >
            Return to bag
          </Link>
        </div>
      </main>
    );
  }

  if (completedOrder) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center px-5 py-20 text-center">
        <div className="w-full rounded-2xl border border-primary/10 bg-surface-lowest p-8 shadow-sm md:p-12">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CheckCircle2 className="size-8" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Order confirmed
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-primary">
            Thank you, {completedOrder.recipientName}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-on-surface-variant">
            Your order has been placed successfully. We will contact you using the phone number provided before delivery.
          </p>
          <div className="mx-auto mt-7 max-w-sm rounded-lg bg-surface-low p-5 text-left">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-on-surface-variant">Order number</span>
              <strong className="text-primary">{completedOrder.orderNumber}</strong>
            </div>
            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="text-on-surface-variant">Total</span>
              <strong className="text-primary">
                {currency.format(completedOrder.totalAmount)}
              </strong>
            </div>
          </div>
          <Link
            href="/products"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3 font-medium text-on-primary"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-xl items-center justify-center px-5 py-20 text-center">
        <div>
          <PackageCheck className="mx-auto size-12 text-primary" />
          <h1 className="mt-5 font-serif text-4xl font-semibold text-primary">
            Nothing to check out yet
          </h1>
          <p className="mt-3 text-on-surface-variant">
            Add an item to your bag before continuing to checkout.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex rounded-md bg-primary px-7 py-3 font-medium text-on-primary"
          >
            Browse products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 lg:py-16">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Return to bag
      </Link>
      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Final step
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">
          Checkout
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <section className="rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8">
          <h2 className="font-serif text-2xl font-semibold text-primary">
            Delivery information
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Enter the details we should use to deliver your order.
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-primary">
              Recipient name
              <input
                name="recipientName"
                defaultValue={user.displayName}
                maxLength={120}
                autoComplete="name"
                required
                disabled={submitting}
                className="h-11 rounded-md border border-primary/15 bg-surface px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-primary">
              Phone number
              <input
                name="recipientPhone"
                type="tel"
                maxLength={30}
                autoComplete="tel"
                placeholder="e.g. +855 12 345 678"
                required
                disabled={submitting}
                className="h-11 rounded-md border border-primary/15 bg-surface px-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-primary sm:col-span-2">
              Shipping address
              <textarea
                name="shippingAddress"
                maxLength={500}
                autoComplete="street-address"
                placeholder="Street, city, province, and delivery notes"
                rows={5}
                required
                disabled={submitting}
                className="resize-y rounded-md border border-primary/15 bg-surface px-3 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>
          </div>

          <div className="mt-8 border-t border-primary/10 pt-7">
            <h2 className="font-serif text-2xl font-semibold text-primary">
              Payment
            </h2>
            <div className="mt-4 flex items-center gap-4 rounded-lg border border-primary/15 bg-surface-low p-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-on-primary">
                <PackageCheck className="size-5" />
              </span>
              <div>
                <p className="font-medium text-primary">Cash on delivery</p>
                <p className="text-sm text-on-surface-variant">
                  Pay when your order arrives.
                </p>
              </div>
              <CheckCircle2 className="ml-auto size-5 text-green-700" />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
        </section>

        <aside className="sticky top-28 rounded-xl border border-primary/10 bg-surface-low p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-primary">
            Order summary
          </h2>
          <div className="mt-5 max-h-64 space-y-4 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-primary">
                    {item.productName}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Qty {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-primary">
                  {currency.format(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
          <div className="my-5 h-px bg-primary/10" />
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-medium text-primary">Total</span>
            <span className="text-2xl font-semibold text-primary">
              {currency.format(cart.totalPrice)}
            </span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3.5 font-medium text-on-secondary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <LockKeyhole className="size-4" />
            )}
            {submitting ? "Placing order..." : "Place order"}
          </button>
          <p className="mt-4 text-center text-xs leading-relaxed text-on-surface-variant">
            Stock and pricing are verified again when you place the order.
          </p>
        </aside>
      </form>
    </main>
  );
}
