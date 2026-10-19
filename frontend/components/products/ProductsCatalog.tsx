"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import ProductCard from "@/components/products/ProductCard";
import type { ProductPage } from "@/types/product";

interface ProductsCatalogProps {
  productPage: ProductPage;
  categoryOptions?: string[];
  initialSearch?: string;
  initialCategory?: string;
  initialSort?: string;
  loadError?: boolean;
}

interface CatalogUrlUpdates {
  q?: string | null;
  category?: string | null;
  sort?: string | null;
  page?: number | null;
}

function categoryName(product: ProductPage["content"][number]) {
  return typeof product.category === "string"
    ? product.category
    : product.category?.name ?? "Collection";
}

export default function ProductsCatalog({
  productPage,
  categoryOptions = [],
  initialSearch = "",
  initialCategory = "all",
  initialSort = "featured",
  loadError = false,
}: ProductsCatalogProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [isNavigating, startTransition] = useTransition();
  const currentPage = productPage.page + 1;
  const products = productPage.content;
  const categories = initialCategory !== "all" && !categoryOptions.includes(initialCategory)
    ? [initialCategory, ...categoryOptions]
    : categoryOptions;
  const hasActiveFilters =
    initialSearch !== "" ||
    initialCategory !== "all" ||
    initialSort !== "featured";

  function catalogHref(updates: CatalogUrlUpdates = {}) {
    const values = {
      q: initialSearch,
      category: initialCategory,
      sort: initialSort,
      page: currentPage,
      ...updates,
    };
    const params = new URLSearchParams();

    if (values.q?.trim()) params.set("q", values.q.trim());
    if (values.category && values.category !== "all") {
      params.set("category", values.category);
    }
    if (values.sort && values.sort !== "featured") {
      params.set("sort", values.sort);
    }
    if (values.page && values.page > 1) {
      params.set("page", String(values.page));
    }

    const query = params.toString();
    return query ? `/products?${query}` : "/products";
  }

  function navigateTo(href: string) {
    startTransition(() => router.push(href));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigateTo(catalogHref({ q: search, page: 1 }));
  }

  function clearFilters() {
    setSearch("");
    navigateTo("/products");
  }

  const firstResult = productPage.totalContents === 0
    ? 0
    : productPage.page * productPage.size + 1;
  const lastResult = Math.min(
    (productPage.page + 1) * productPage.size,
    productPage.totalContents,
  );

  return (
    <section
      id="catalog-results"
      className="mx-auto max-w-350 scroll-mt-24 px-5 py-12 md:px-8 lg:px-12"
      aria-busy={isNavigating}
    >
        <form
          onSubmit={submitSearch}
          className="mb-8 grid gap-3 rounded-lg border border-outline/15 bg-surface-lowest p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_auto_auto]"
        >
          <div className="flex min-w-0 rounded bg-surface-low focus-within:ring-2 focus-within:ring-primary/15">
            <label className="flex min-w-0 flex-1 items-center gap-2 px-4 py-3">
              <span className="material-symbols-outlined text-[19px] text-outline" aria-hidden="true">search</span>
              <span className="sr-only">Search the collection</span>
              <input
                type="search"
                enterKeyHint="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product, brand, category, or SKU"
                className="min-w-0 w-full bg-transparent text-sm text-on-surface outline-none"
              />
            </label>
            <button
              type="submit"
              disabled={isNavigating}
              className="cursor-pointer border-l border-outline/15 px-4 text-sm font-semibold text-primary transition-colors hover:bg-surface-high disabled:cursor-wait disabled:opacity-50"
            >
              Search
            </button>
          </div>
          <label className="flex items-center justify-between gap-2 rounded bg-surface-low px-4 py-3 text-sm text-on-surface-variant md:justify-start">
            <span>Category</span>
            <select
              value={initialCategory}
              disabled={isNavigating}
              onChange={(event) => navigateTo(catalogHref({ category: event.target.value, page: 1 }))}
              className="min-w-0 cursor-pointer bg-transparent font-medium text-primary outline-none disabled:cursor-wait"
            >
              <option value="all">All</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="flex items-center justify-between gap-2 rounded bg-surface-low px-4 py-3 text-sm text-on-surface-variant md:justify-start">
            <span>Sort</span>
            <select
              value={initialSort}
              disabled={isNavigating}
              onChange={(event) => navigateTo(catalogHref({ sort: event.target.value, page: 1 }))}
              className="min-w-0 cursor-pointer bg-transparent font-medium text-primary outline-none disabled:cursor-wait"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </form>

        <div className="mb-7 flex items-center justify-between gap-4" aria-live="polite">
          <p className="text-sm text-on-surface-variant">
            {productPage.totalContents > 0 ? (
              <>Showing <span className="font-semibold text-primary">{firstResult}–{lastResult}</span> of {productPage.totalContents}</>
            ) : (
              <><span className="font-semibold text-primary">0</span> products</>
            )}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              disabled={isNavigating}
              className="cursor-pointer text-sm font-medium text-secondary hover:underline disabled:cursor-wait disabled:opacity-50"
            >
              Clear filters
            </button>
          )}
        </div>

        {loadError ? (
          <div className="rounded-lg border border-secondary/20 bg-secondary/5 px-6 py-14 text-center">
            <h2 className="font-serif text-2xl font-semibold text-primary">The catalog is temporarily unavailable.</h2>
            <p className="mt-2 text-on-surface-variant">Please refresh the page shortly.</p>
          </div>
        ) : productPage.totalContents === 0 && !hasActiveFilters ? (
          <div className="rounded-lg bg-surface-low px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-primary">No products found</h2>
            <p className="mt-2 text-on-surface-variant">Our collection is empty right now. Please check back soon.</p>
          </div>
        ) : productPage.totalContents === 0 ? (
          <div className="rounded-lg bg-surface-low px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-primary">No matching products</h2>
            <p className="mt-2 text-on-surface-variant">Try a different search or reset the filters.</p>
            <button type="button" onClick={clearFilters} className="mt-5 cursor-pointer rounded bg-primary px-5 py-2.5 text-sm font-medium text-on-primary">Reset filters</button>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-2 justify-items-center gap-3 transition-opacity sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 ${isNavigating ? "opacity-55" : "opacity-100"}`}>
              {products.map((product) => {
                const salePrice = product.discountPrice != null && product.discountPrice < product.price
                  ? product.discountPrice
                  : product.price;
                const hasDiscount = salePrice < product.price;

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    image={product.imageUrl ?? "https://placehold.co/600x600/FBF9F6/14213D?text=Product"}
                    name={product.name}
                    category={categoryName(product)}
                    rating={product.averageRating}
                    reviewCount={product.reviewCount}
                    price={salePrice}
                    originalPrice={hasDiscount ? product.price : undefined}
                    badge={hasDiscount ? "Sale" : undefined}
                    stockQuantity={product.stockQuantity}
                  />
                );
              })}
            </div>

            {productPage.totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-between gap-4 border-t border-outline/15 pt-6" aria-label="Product pagination">
                {productPage.first ? (
                  <span className="rounded-md border border-primary/15 px-4 py-2 text-sm font-medium text-on-surface-variant opacity-45">Previous</span>
                ) : (
                  <Link
                    href={catalogHref({ page: currentPage - 1 })}
                    prefetch={false}
                    className="rounded-md border border-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-low"
                  >
                    Previous
                  </Link>
                )}
                <p className="text-center text-sm text-on-surface-variant">
                  Page <span className="font-semibold text-primary">{currentPage}</span> of {productPage.totalPages}
                </p>
                {productPage.last ? (
                  <span className="rounded-md border border-primary/15 px-4 py-2 text-sm font-medium text-on-surface-variant opacity-45">Next</span>
                ) : (
                  <Link
                    href={catalogHref({ page: currentPage + 1 })}
                    prefetch={false}
                    className="rounded-md border border-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-low"
                  >
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
    </section>
  );
}
