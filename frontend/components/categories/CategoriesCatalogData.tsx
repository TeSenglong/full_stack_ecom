import "server-only";

import Link from "next/link";
import { unstable_rethrow } from "next/navigation";

import ProgressiveImage from "@/components/products/ProgressiveImage";
import { getCategories } from "@/lib/api/categories";
import type { Category } from "@/types/product";

const FALLBACK_IMAGE = "/home.jpg";

export default async function CategoriesCatalogData() {
  let categories: Category[] = [];
  let loadError = false;

  try {
    categories = await getCategories();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Unable to load storefront categories:", error);
    loadError = true;
  }

  return (
    <section className="mx-auto max-w-350 px-5 py-16 md:px-8 lg:px-12">
      <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-primary md:text-4xl">
            Current categories
          </h2>
          <p className="mt-2 text-on-surface-variant">
            Select a category to see its available products.
          </p>
        </div>
        {!loadError && categories.length > 0 && (
          <p className="text-sm text-on-surface-variant">
            <span className="font-semibold text-primary">{categories.length}</span>{" "}
            {categories.length === 1 ? "category" : "categories"}
          </p>
        )}
      </div>

      {loadError ? (
        <div className="rounded-xl border border-secondary/20 bg-secondary/5 px-6 py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-secondary">cloud_off</span>
          <h2 className="mt-4 font-serif text-2xl font-semibold text-primary">
            Categories are temporarily unavailable
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-on-surface-variant">
            The store service may still be waking up. Please refresh in a moment or browse the complete catalog.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
          >
            Browse all products
          </Link>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-primary/20 bg-surface-low px-6 py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-secondary">category</span>
          <h2 className="mt-4 font-serif text-2xl font-semibold text-primary">
            Categories are coming soon
          </h2>
          <p className="mt-2 text-on-surface-variant">
            New collections will appear here when they are added to the store.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group overflow-hidden rounded-xl border border-primary/10 bg-surface-lowest shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <ProgressiveImage
                src={category.imageUrl || FALLBACK_IMAGE}
                alt={`${category.name} category`}
                className="aspect-4/3 w-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  Collection {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-primary">
                  {category.name}
                </h2>
                <p className="mt-3 line-clamp-3 min-h-15 text-sm leading-relaxed text-on-surface-variant">
                  {category.description?.trim() ||
                    `Explore every product available in the ${category.name} collection.`}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Shop this category
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                    east
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
