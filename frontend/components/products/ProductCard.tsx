"use client";

import { useRouter } from "next/navigation";
import { CustomerAddToCartButton } from "@/components/cart/CustomerAddToCartButton";
import ProgressiveImage from "@/components/products/ProgressiveImage";

interface ProductCardProps {
  id?: number | string;
  image: string;
  name: string;
  category: string;
  rating: number;
  price: number;
  originalPrice?: number;
  badge?: string;
  stockQuantity?: number;
}

export default function ProductCard({
  id,
  image,
  name,
  category,
  rating,
  price,
  originalPrice,
  badge,
  stockQuantity,
}: ProductCardProps) {
  const router = useRouter();

  const formatPrice = (value?: number | null) => {
    if (value == null || Number.isNaN(Number(value))) return "";
    return `$${Number(value).toFixed(2)}`;
  };

  return (
    <article
      onClick={() => id !== undefined && router.push(`/products/${id}`)}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && id !== undefined) {
          router.push(`/products/${id}`);
        }
      }}
      role={id !== undefined ? "link" : undefined}
      tabIndex={id !== undefined ? 0 : undefined}
      className={`group w-full max-w-sm overflow-hidden rounded-lg border border-primary/15 bg-surface-lowest shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg ${id !== undefined ? "cursor-pointer" : ""}`}
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        <ProgressiveImage
          src={image}
          alt={name}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute left-3 top-3 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-on-secondary">
            {badge}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5">
        <p className="mb-1 text-xs uppercase tracking-wide text-on-surface-variant">{category}</p>
        <h3 className="mb-1.5 line-clamp-2 font-serif text-base font-semibold leading-snug text-primary sm:text-lg">{name}</h3>
        <div className="mb-3 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              viewBox="0 0 20 20"
              className={`h-4 w-4 ${star <= Math.round(rating) ? "fill-secondary" : "fill-primary/10"}`}
              aria-hidden="true"
            >
              <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
            </svg>
          ))}
          <span className="ml-1 text-xs text-on-surface-variant">{rating.toFixed(1)}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-primary">{formatPrice(price)}</span>
            {originalPrice != null && (
              <span className="text-sm text-on-surface-variant line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
          {id !== undefined && (
            <CustomerAddToCartButton
              productId={id}
              disabled={stockQuantity === 0}
              label="Cart"
              className="px-4 py-2"
            />
          )}
        </div>
      </div>
    </article>
  );
}
