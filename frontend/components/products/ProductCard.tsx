"use client";

import Link from "next/link";
import { CustomerAddToCartButton } from "@/components/cart/CustomerAddToCartButton";
import ProgressiveImage from "@/components/products/ProgressiveImage";
import en from "@/messages/en.json";
import type { Language, Messages } from "@/lib/i18n";

interface ProductCardProps {
  id?: number | string;
  image: string;
  name: string;
  category: string;
  rating?: number | null;
  reviewCount?: number | null;
  price: number;
  originalPrice?: number;
  badge?: string;
  stockQuantity?: number;
  labels?: Messages["productCard"];
  language?: Language;
  categoryLanguage?: Language;
}

export default function ProductCard({
  id,
  image,
  name,
  category,
  rating,
  reviewCount,
  price,
  originalPrice,
  badge,
  stockQuantity,
  labels = en.productCard,
  language = "en",
  categoryLanguage = "en",
}: ProductCardProps) {
  const formatPrice = (value?: number | null) => {
    if (value == null || Number.isNaN(Number(value))) return "";
    return `$${Number(value).toFixed(2)}`;
  };

  const productHref = id === undefined ? undefined : `/products/${id}`;
  const hasRating =
    rating != null &&
    Number.isFinite(rating) &&
    rating > 0 &&
    (reviewCount == null || reviewCount > 0);

  const productImage = (
    <ProgressiveImage
      src={image}
      alt={name}
      className="h-full w-full transition-transform duration-300 group-hover:scale-105"
    />
  );

  return (
    <article
      className="group flex w-full max-w-sm flex-col overflow-hidden rounded-lg border border-primary/15 bg-surface-lowest shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        {productHref ? (
          <Link
            href={productHref}
            aria-label={`${labels.view} ${name}`}
            className="block h-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
          >
            {productImage}
          </Link>
        ) : productImage}
        {badge && (
          <span className="absolute left-3 top-3 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-on-secondary">
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <p lang={categoryLanguage === "kh" ? "km" : "en"} className="catalog-content mb-1 hidden text-xs uppercase tracking-wide text-on-surface-variant sm:block">{category}</p>
        <h3 lang="en" className="mb-0 line-clamp-2 min-h-10 font-serif text-sm font-semibold leading-snug text-primary sm:min-h-0 sm:text-lg">
          {productHref ? (
            <Link href={productHref} className="rounded-sm hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              {name}
            </Link>
          ) : name}
        </h3>
        {hasRating ? (
          <div
            className="mb-3 flex items-center gap-0.5 sm:gap-1"
            aria-label={`${labels.rated} ${rating.toFixed(1)} ${labels.outOfFive}${reviewCount ? ` ${labels.from} ${reviewCount} ${labels.reviews}` : ""}`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                viewBox="0 0 20 20"
                className={`size-3.5 sm:size-4 ${star <= Math.round(rating) ? "fill-tertiary" : "fill-primary/10"}`}
                aria-hidden="true"
              >
                <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
              </svg>
            ))}
            <span className="ml-1 text-[11px] text-on-surface-variant sm:text-xs">
              {rating.toFixed(1)}{reviewCount ? ` (${reviewCount})` : ""}
            </span>
          </div>
        ) : (
          <p className="mb-3 text-[11px] text-on-surface-variant sm:text-xs">{labels.noReviews}</p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <span className="block text-base font-semibold text-primary sm:inline sm:text-lg">{formatPrice(price)}</span>
            {originalPrice != null && (
              <span className="block text-xs text-on-surface-variant line-through sm:ml-2 sm:inline sm:text-sm">{formatPrice(originalPrice)}</span>
            )}
          </div>
          {id !== undefined && (
            <CustomerAddToCartButton
              productId={id}
              disabled={stockQuantity === 0}
              label={labels.cart}
              unavailableLabel={labels.unavailable}
              addingLabel={labels.adding}
              mobileIconOnly
              className={`min-h-10 min-w-10 shrink-0 px-3 py-2 sm:px-4 ${language === "kh" ? "khmer-text" : ""}`}
            />
          )}
        </div>
      </div>
    </article>
  );
}
