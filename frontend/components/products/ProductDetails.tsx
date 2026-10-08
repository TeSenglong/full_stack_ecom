"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { CustomerAddToCartButton } from "@/components/cart/CustomerAddToCartButton";
import { useCustomerCart } from "@/components/cart/CustomerCartProvider";
import { formatProductReleaseDate } from "@/lib/date";
import type { Product } from "@/types/product";

export default function ProductDetails({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { cart } = useCustomerCart();
  const {
    name,
    sku,
    description,
    price,
    discountPrice,
    stockQuantity,
    imageUrl,
    brand,
    releaseDate,
    category,
  } = product;

  const categoryName = typeof category === "string" ? category : category?.name;
  const hasDiscount = discountPrice != null && discountPrice < price;
  const salePrice = hasDiscount ? discountPrice : price;
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;
  const inStock = stockQuantity > 0;
  const lowStock = inStock && stockQuantity <= 5;
  const formattedReleaseDate = formatProductReleaseDate(releaseDate);
  const alreadyInCart = cart.items.some((item) => item.productId === product.id);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-primary md:px-12">
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-on-surface-variant" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-primary">Home</Link>
        {categoryName && <><span>/</span><span>{categoryName}</span></>}
        <span>/</span>
        <span className="max-w-50 truncate font-medium text-primary">{name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="self-start md:sticky md:top-28">
          <div className="group relative aspect-square overflow-hidden rounded-xl border border-primary/10 bg-surface">
            <img
              src={imageUrl || "https://placehold.co/600x600/FBF9F6/14213D?text=Product"}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {hasDiscount && (
              <span className="absolute left-4 top-4 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-on-secondary shadow-sm">−{discountPercent}%</span>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-on-surface-variant">{[brand, categoryName].filter(Boolean).join(" · ")}</p>
          <h1 className="mb-3 font-serif text-3xl font-semibold leading-tight md:text-4xl">{name}</h1>
          <p className="mb-5 text-xs text-on-surface-variant">SKU {sku}{formattedReleaseDate && ` · ${formattedReleaseDate}`}</p>

          <div className="mb-1 flex items-baseline gap-3">
            <span className="text-3xl font-semibold tracking-tight">${salePrice.toFixed(2)}</span>
            {hasDiscount && <span className="text-lg text-on-surface-variant line-through">${price.toFixed(2)}</span>}
          </div>
          {hasDiscount ? (
            <p className="mb-5 text-sm font-medium text-secondary">You save ${(price - discountPrice).toFixed(2)}</p>
          ) : <div className="mb-5" />}

          <div className="mb-6 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${inStock ? (lowStock ? "bg-secondary" : "bg-green-600") : "bg-red-500"}`} />
            <span className={`text-sm font-medium ${inStock ? (lowStock ? "text-secondary" : "text-green-700") : "text-red-600"}`}>
              {!inStock ? "Out of stock" : lowStock ? `Only ${stockQuantity} left — order soon` : "In stock"}
            </span>
          </div>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            {inStock && !alreadyInCart && (
              <div className="flex w-fit items-center rounded-md border border-primary/15">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} className="cursor-pointer rounded-l-md px-3 py-2.5 text-lg leading-none transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Decrease quantity">−</button>
                <span className="w-10 select-none text-center text-sm font-medium">{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => Math.min(stockQuantity, value + 1))} disabled={quantity >= stockQuantity} className="cursor-pointer rounded-r-md px-3 py-2.5 text-lg leading-none transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Increase quantity">+</button>
              </div>
            )}
            <div className="flex flex-1 gap-3">
              <CustomerAddToCartButton
                productId={product.id}
                quantity={quantity}
                disabled={!inStock}
                showIcon
                label="Cart"
                className="flex-1 cursor-pointer rounded-md bg-primary px-6 py-3 font-medium text-on-primary transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              />
              <button type="button" aria-label="Add to wishlist" className="cursor-pointer rounded-md border border-primary/15 px-4 transition-colors hover:bg-primary/5">♡</button>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-md bg-surface py-3 px-2"><p className="text-xs font-medium">Free shipping</p><p className="text-[11px] text-on-surface-variant">Orders over $50</p></div>
            <div className="rounded-md bg-surface py-3 px-2"><p className="text-xs font-medium">Easy returns</p><p className="text-[11px] text-on-surface-variant">30-day window</p></div>
            <div className="rounded-md bg-surface py-3 px-2"><p className="text-xs font-medium">Secure checkout</p><p className="text-[11px] text-on-surface-variant">Encrypted payment</p></div>
          </div>

          <div className="mb-6 border-t border-primary/10 pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Description</h2>
            <p className="text-[15px] leading-relaxed text-on-surface-variant">{description}</p>
          </div>
          <div className="border-t border-primary/10 pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide">Details</h2>
            <dl className="divide-y divide-primary/5 text-sm">
              {[["Brand", brand], ["Category", categoryName], ["SKU", sku], ["Release date", formattedReleaseDate]]
                .filter(([, value]) => value != null && value !== "")
                .map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between py-2"><dt className="text-on-surface-variant">{label}</dt><dd className="font-medium">{value}</dd></div>
                ))}
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
