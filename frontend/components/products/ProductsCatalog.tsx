"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ProductCard from "@/components/products/ProductCard";
import { productReleaseTimestamp } from "@/lib/date";
import type { Product } from "@/types/product";

interface ProductsCatalogProps {
  products: Product[];
  initialSearch?: string;
  initialCategory?: string;
  initialSort?: string;
  loadError?: boolean;
}

function categoryName(product: Product) {
  return typeof product.category === "string"
    ? product.category
    : product.category?.name ?? "Collection";
}

export default function ProductsCatalog({
  products,
  initialSearch = "",
  initialCategory = "all",
  initialSort = "featured",
  loadError = false,
}: ProductsCatalogProps) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);

  const categories = useMemo(
    () => Array.from(new Set(products.map(categoryName))).sort(),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const productCategory = categoryName(product);
      const matchesCategory = category === "all" || productCategory === category;
      const matchesSearch =
        normalizedSearch === "" ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.description?.toLowerCase().includes(normalizedSearch) ||
        product.brand?.toLowerCase().includes(normalizedSearch) ||
        productCategory.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((left, right) => {
      const leftPrice = left.discountPrice ?? left.price;
      const rightPrice = right.discountPrice ?? right.price;

      if (sort === "price-low") return leftPrice - rightPrice;
      if (sort === "price-high") return rightPrice - leftPrice;
      if (sort === "name") return left.name.localeCompare(right.name);
      if (sort === "newest") {
        return productReleaseTimestamp(right.releaseDate) - productReleaseTimestamp(left.releaseDate);
      }
      return left.id - right.id;
    });
  }, [category, products, search, sort]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("featured");
  };

  return (
    <main className="min-h-screen bg-surface">
      <section className="border-b border-outline/15 bg-surface-low">
        <div className="mx-auto max-w-350 px-5 py-16 md:px-8 lg:px-12">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">The Complete Edit</span>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-tight text-primary md:text-6xl">Objects selected for a quieter way of living.</h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">Browse enduring furniture, apparel, lighting, and crafted objects chosen for their material honesty and everyday usefulness.</p>
        </div>
      </section>

      <section className="mx-auto max-w-350 px-5 py-12 md:px-8 lg:px-12">
        <div className="mb-8 grid gap-3 rounded-lg border border-outline/15 bg-surface-lowest p-4 shadow-sm md:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-2 rounded bg-surface-low px-4 py-3">
            <span className="material-symbols-outlined text-[19px] text-outline">search</span>
            <span className="sr-only">Search the collection</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by product, brand, or category" className="w-full bg-transparent text-sm text-on-surface outline-none" />
          </label>
          <label className="flex items-center gap-2 rounded bg-surface-low px-4 py-3 text-sm text-on-surface-variant">
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="cursor-pointer bg-transparent font-medium text-primary outline-none">
              <option value="all">All</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 rounded bg-surface-low px-4 py-3 text-sm text-on-surface-variant">
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="cursor-pointer bg-transparent font-medium text-primary outline-none">
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
        </div>

        <div className="mb-7 flex items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant"><span className="font-semibold text-primary">{visibleProducts.length}</span> {visibleProducts.length === 1 ? "artifact" : "artifacts"}</p>
          {(search || category !== "all" || sort !== "featured") && <button type="button" onClick={clearFilters} className="cursor-pointer text-sm font-medium text-secondary hover:underline">Clear filters</button>}
        </div>

        {loadError ? (
          <div className="rounded-lg border border-secondary/20 bg-secondary/5 px-6 py-14 text-center">
            <h2 className="font-serif text-2xl font-semibold text-primary">The collection is temporarily unavailable.</h2>
            <p className="mt-2 text-on-surface-variant">Start the product API and refresh this page to see the catalog.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-lg bg-surface-low px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-primary">No products found</h2>
            <p className="mt-2 text-on-surface-variant">Our collection is empty right now. Please check back soon.</p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-lg bg-surface-low px-6 py-16 text-center">
            <h2 className="font-serif text-2xl font-semibold text-primary">No matching artifacts</h2>
            <p className="mt-2 text-on-surface-variant">Try a different search or reset the filters.</p>
            <button type="button" onClick={clearFilters} className="mt-5 cursor-pointer rounded bg-primary px-5 py-2.5 text-sm font-medium text-on-primary">Reset filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.imageUrl ?? "https://placehold.co/600x600/FBF9F6/14213D?text=Product"}
                name={product.name}
                category={categoryName(product)}
                rating={product.averageRating ?? 4.8}
                price={product.discountPrice ?? product.price}
                originalPrice={product.discountPrice != null ? product.price : undefined}
                badge={product.discountPrice != null ? "Sale" : undefined}
                stockQuantity={product.stockQuantity}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-350 px-5 pb-20 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg bg-brand-panel p-8 text-on-brand shadow-sm md:flex-row md:items-center md:p-12">
          <div><span className="text-[11px] uppercase tracking-[0.12em] text-[#ffb59d]">Our approach</span><h2 className="mt-1 font-serif text-3xl font-semibold">Meet the hands behind the collection.</h2></div>
          <Link
            href="/about"
            prefetch={false}
            className="rounded bg-[#f4f0e9] px-6 py-3 text-sm font-semibold text-[#26332c] transition-colors hover:bg-white"
          >
            Discover MOHAORI
          </Link>
        </div>
      </section>

    </main>
  );
}
