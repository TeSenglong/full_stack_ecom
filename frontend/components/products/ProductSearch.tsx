"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import ProductCard from "@/components/products/ProductCard";
import type { Product } from "@/types/product";

interface ProductSearchProps {
  products: Product[];
  initialQuery?: string;
  loadError?: boolean;
}

function categoryName(product: Product) {
  return typeof product.category === "string"
    ? product.category
    : product.category?.name ?? "Collection";
}

export default function ProductSearch({
  products,
  initialQuery = "",
  loadError = false,
}: ProductSearchProps) {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    return products.filter((product) => {
      const category = categoryName(product);

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.description?.toLowerCase().includes(normalizedQuery) ||
        product.brand?.toLowerCase().includes(normalizedQuery) ||
        product.sku.toLowerCase().includes(normalizedQuery) ||
        category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [products, query]);

  const hasQuery = query.trim().length > 0;

  return (
    <main className="min-h-screen bg-surface">
      <section className="border-b border-outline/15 bg-surface-low">
        <div className="mx-auto max-w-350 px-5 py-10 md:px-8 md:py-14 lg:px-12">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
            Find your next piece
          </span>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">
            Search the collection
          </h1>
          <p className="mt-3 max-w-2xl text-on-surface-variant">
            Search by product name, brand, category, description, or SKU.
          </p>

          <label className="mt-7 flex max-w-3xl items-center gap-3 rounded-xl border border-outline/20 bg-surface-lowest px-4 py-3 shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
            <span
              className="material-symbols-outlined text-[24px] text-outline"
              aria-hidden="true"
            >
              search
            </span>
            <span className="sr-only">Search products</span>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What are you looking for?"
              className="min-w-0 flex-1 bg-transparent text-base text-on-surface outline-none placeholder:text-on-surface-variant/65"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-high hover:text-primary"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  aria-hidden="true"
                >
                  close
                </span>
              </button>
            )}
          </label>
        </div>
      </section>

      <section
        aria-live="polite"
        className="mx-auto max-w-350 px-5 py-10 md:px-8 lg:px-12"
      >
        {loadError ? (
          <div className="rounded-xl border border-secondary/20 bg-secondary/5 px-6 py-14 text-center">
            <h2 className="font-serif text-2xl font-semibold text-primary">
              Search is temporarily unavailable
            </h2>
            <p className="mt-2 text-on-surface-variant">
              The product service could not be reached. Please try again shortly.
            </p>
          </div>
        ) : !hasQuery ? (
          <div className="rounded-xl border border-outline/15 bg-surface-lowest px-6 py-16 text-center shadow-sm">
            <span
              className="material-symbols-outlined text-4xl text-secondary"
              aria-hidden="true"
            >
              manage_search
            </span>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">
              Start typing to search
            </h2>
            <p className="mx-auto mt-2 max-w-md text-on-surface-variant">
              We’ll look across names, brands, categories, descriptions, and product codes.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
            >
              Browse all products
            </Link>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-xl bg-surface-low px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-primary">
              No products found
            </h2>
            <p className="mt-2 text-on-surface-variant">
              Try a shorter term or search by a different brand or category.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-on-surface-variant">
                <span className="font-semibold text-primary">{results.length}</span>{" "}
                {results.length === 1 ? "result" : "results"} for “{query.trim()}”
              </p>
              <Link
                href="/products"
                className="shrink-0 text-sm font-semibold text-primary hover:opacity-70"
              >
                All products
              </Link>
            </div>
            <div className="grid grid-cols-2 justify-items-center gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((product) => {
                const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    image={
                      product.imageUrl ??
                      "https://placehold.co/600x600/FBF9F6/14213D?text=Product"
                    }
                    name={product.name}
                    category={categoryName(product)}
                    rating={product.averageRating}
                    reviewCount={product.reviewCount}
                    price={hasDiscount && product.discountPrice != null ? product.discountPrice : product.price}
                    originalPrice={hasDiscount ? product.price : undefined}
                    badge={hasDiscount ? "Sale" : undefined}
                    stockQuantity={product.stockQuantity}
                  />
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
