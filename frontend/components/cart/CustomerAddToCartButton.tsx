"use client";

import { LoaderCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";

import { useCustomerCart } from "@/components/cart/CustomerCartProvider";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface CustomerAddToCartButtonProps {
  productId: number | string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  unavailableLabel?: string;
  showIcon?: boolean;
}

export function CustomerAddToCartButton({
  productId,
  quantity = 1,
  disabled = false,
  className,
  label = "Cart",
  unavailableLabel = "Unavailable",
  showIcon = false,
}: CustomerAddToCartButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const {
    cart,
    loading: cartLoading,
    addItem,
    updateItemOptimistically,
    removeItem,
  } = useCustomerCart();
  const pathname = usePathname();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const numericProductId = Number(productId);
  const invalidProduct = !Number.isInteger(numericProductId) || numericProductId <= 0;
  const cartItem = cart.items.find(
    (item) => item.productId === numericProductId,
  );

  function redirectToLogin() {
    router.push(
      `/login?next=${encodeURIComponent(pathname || "/products")}`,
    );
  }

  function handleError(error: unknown, fallback: string) {
    if (error instanceof Error && error.name === "AuthenticationError") {
      toast.error("Your session expired. Please sign in again.");
      redirectToLogin();
      return;
    }

    toast.error(error instanceof Error ? error.message : fallback);
  }

  async function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (!user) {
      redirectToLogin();
      return;
    }

    setSubmitting(true);

    try {
      await addItem(numericProductId, quantity);
      toast.success(`Added to your bag`);
    } catch (error) {
      handleError(error, "Unable to add this product");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeCurrentItem() {
    if (!cartItem) {
      return;
    }

    setSubmitting(true);

    try {
      await removeItem(cartItem.id);
      toast.success("Item removed from your bag");
    } catch (error) {
      handleError(error, "Unable to update this product");
    } finally {
      setSubmitting(false);
    }
  }

  function changeCartQuantity(nextQuantity: number) {
    if (!cartItem) {
      return;
    }

    if (nextQuantity <= 0) {
      void removeCurrentItem();
      return;
    }

    updateItemOptimistically(cartItem.id, nextQuantity);
  }

  const isDisabled =
    disabled || invalidProduct || submitting || authLoading || cartLoading;

  if (cartItem) {
    return (
      <div
        className={cn(
          "inline-flex h-10 items-center overflow-hidden rounded-md border border-primary/15 bg-surface-lowest text-primary shadow-sm",
          showIcon && "flex-1",
        )}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        aria-label={`${cartItem.quantity} ${cartItem.productName} in cart`}
      >
        <button
          type="button"
          aria-label={`Remove one ${cartItem.productName}`}
          onClick={() => changeCartQuantity(cartItem.quantity - 1)}
          disabled={submitting}
          className="flex h-full min-w-10 cursor-pointer items-center justify-center transition-colors hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span className="flex min-w-14 flex-1 items-center justify-center gap-1.5 border-x border-primary/10 px-2 text-sm font-semibold tabular-nums">
          {submitting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <>
              <ShoppingBag className="size-3.5" />
              {cartItem.quantity}
            </>
          )}
        </span>
        <button
          type="button"
          aria-label={`Add one more ${cartItem.productName}`}
          onClick={() => changeCartQuantity(cartItem.quantity + 1)}
          disabled={submitting || cartItem.quantity >= cartItem.stockQuantity}
          className="flex h-full min-w-10 cursor-pointer items-center justify-center transition-colors hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      onKeyDown={(event) => event.stopPropagation()}
      disabled={isDisabled}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
    >
      {submitting ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : disabled ? null : (
        <Plus className="size-4" aria-hidden="true" />
      )}
      {showIcon && !submitting && !disabled && (
        <ShoppingBag className="size-4" aria-hidden="true" />
      )}
      {disabled
        ? unavailableLabel
        : submitting
          ? "Adding..."
          : label}
    </button>
  );
}
