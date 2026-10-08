"use client";

import {
  ArrowRight,
  LoaderCircle,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { useCustomerCart } from "@/components/cart/CustomerCartProvider";
import ProgressiveImage from "@/components/products/ProgressiveImage";
import { useAuth } from "@/hooks/useAuth";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function CustomerCartPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    cart,
    loading,
    loadError,
    refreshCart,
    updateItemOptimistically,
    removeItem,
    clearCart,
  } = useCustomerCart();
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  function changeQuantity(itemId: number, quantity: number) {
    updateItemOptimistically(itemId, quantity);
  }

  async function remove(itemId: number) {
    setPendingItemId(itemId);

    try {
      await removeItem(itemId);
      toast.success("Item removed from your bag");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove item");
    } finally {
      setPendingItemId(null);
    }
  }

  async function clear() {
    setClearing(true);

    try {
      await clearCart();
      toast.success("Your bag is now empty");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to clear your bag");
    } finally {
      setClearing(false);
    }
  }

  if (authLoading || loading) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-350 px-5 py-14 md:px-8 lg:px-12">
        <div className="h-10 w-56 animate-pulse rounded bg-surface-high" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="h-72 animate-pulse rounded-xl bg-surface-low" />
          <div className="h-72 animate-pulse rounded-xl bg-surface-low" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center px-5 py-20 text-center">
        <div>
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-surface-high text-primary">
            <ShoppingBag className="size-7" />
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold text-primary">
            Sign in to view your bag
          </h1>
          <p className="mx-auto mt-3 max-w-md text-on-surface-variant">
            Your saved cart is connected to your account, so it stays with you across visits.
          </p>
          <Link
            href="/login?next=%2Fcart"
            className="mt-7 inline-flex rounded-md bg-primary px-7 py-3 font-medium text-on-primary transition-opacity hover:opacity-90"
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
          <ShoppingBag className="mx-auto size-12 text-primary" />
          <h1 className="mt-5 font-serif text-4xl font-semibold text-primary">
            We couldn&apos;t load your bag
          </h1>
          <p className="mt-3 text-on-surface-variant">{loadError}</p>
          <button
            type="button"
            onClick={() => void refreshCart().catch(() => undefined)}
            className="mt-7 cursor-pointer rounded-md bg-primary px-7 py-3 font-medium text-on-primary"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (cart.items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center px-5 py-20 text-center">
        <div>
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-surface-high text-primary">
            <ShoppingBag className="size-7" />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Your bag
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-primary">
            Your bag is empty
          </h1>
          <p className="mx-auto mt-3 max-w-md text-on-surface-variant">
            Discover objects made to bring intention and quiet beauty into everyday life.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3 font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            Explore the collection
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-350 px-5 py-12 md:px-8 lg:px-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-primary/10 pb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Your selection
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">
            Shopping bag
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            {cart.totalItems} {cart.totalItems === 1 ? "item" : "items"}
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          disabled={clearing}
          className="inline-flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant underline-offset-4 hover:text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {clearing ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          Clear bag
        </button>
      </div>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-label="Cart items" className="divide-y divide-primary/10">
          {cart.items.map((item) => {
            const pending = pendingItemId === item.id;
            const discounted = item.originalPrice > item.unitPrice;

            return (
              <article key={item.id} className="grid grid-cols-[96px_1fr] gap-5 py-6 first:pt-0 sm:grid-cols-[120px_1fr_auto]">
                <Link
                  href={`/products/${item.productId}`}
                  className="aspect-square overflow-hidden rounded-lg border border-primary/10 bg-surface-low"
                >
                  {item.productImageUrl ? (
                    <ProgressiveImage
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="h-full w-full"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-on-surface-variant">
                      No image
                    </span>
                  )}
                </Link>

                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                    SKU {item.productSku}
                  </p>
                  <Link
                    href={`/products/${item.productId}`}
                    className="mt-1 block truncate font-serif text-xl font-semibold text-primary hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <div className="mt-2 flex items-baseline gap-2 sm:hidden">
                    <span className="font-semibold text-primary">
                      {currency.format(item.unitPrice)}
                    </span>
                    {discounted && (
                      <span className="text-sm text-on-surface-variant line-through">
                        {currency.format(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center rounded-md border border-primary/15 bg-surface-lowest">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.productName} quantity`}
                        onClick={() => changeQuantity(item.id, item.quantity - 1)}
                        disabled={pending || item.quantity <= 1}
                        className="cursor-pointer p-2.5 text-primary disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-9 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.productName} quantity`}
                        onClick={() => changeQuantity(item.id, item.quantity + 1)}
                        disabled={pending || item.quantity >= item.stockQuantity}
                        className="cursor-pointer p-2.5 text-primary disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      disabled={pending}
                      className="cursor-pointer text-sm text-on-surface-variant underline-offset-4 hover:text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>

                  {item.quantity >= item.stockQuantity && (
                    <p className="mt-2 text-xs text-secondary">
                      Maximum available quantity selected
                    </p>
                  )}
                </div>

                <div className="hidden min-w-28 text-right sm:block">
                  <p className="font-semibold text-primary">
                    {currency.format(item.subtotal)}
                  </p>
                  {discounted && (
                    <p className="mt-1 text-xs text-on-surface-variant">
                      {currency.format(item.unitPrice)} each
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <aside className="sticky top-28 rounded-xl border border-primary/10 bg-surface-low p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-primary">
            Order summary
          </h2>
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Subtotal</dt>
              <dd className="font-medium text-primary">
                {currency.format(cart.totalPrice)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-on-surface-variant">Shipping</dt>
              <dd className="text-right text-primary">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="my-5 h-px bg-primary/10" />
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-medium text-primary">Estimated total</span>
            <span className="text-2xl font-semibold text-primary">
              {currency.format(cart.totalPrice)}
            </span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3.5 font-medium text-on-primary transition-opacity hover:opacity-90"
          >
            Continue to checkout
            <ArrowRight className="size-4" />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-on-surface-variant">
            <ShieldCheck className="size-4" />
            Secure account-protected checkout
          </div>
          <Link
            href="/products"
            className="mt-5 block text-center text-sm text-primary underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  );
}
