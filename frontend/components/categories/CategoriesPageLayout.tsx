import Link from "next/link";
import type { ReactNode } from "react";

export default function CategoriesPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-surface">
      <section className="border-b border-outline/15 bg-surface-low">
        <div className="mx-auto max-w-350 px-5 py-16 md:px-8 md:py-20 lg:px-12">
          <div className="flex max-w-4xl flex-col items-start">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
              Shop your way
            </span>
            <h1 className="mt-3 font-serif text-5xl font-semibold leading-tight text-primary md:text-6xl">
              Browse by category
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">
              Explore the MOHAORI catalog by collection and quickly find the products that suit your everyday needs.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-secondary px-6 py-3 text-sm font-semibold text-on-secondary transition-opacity hover:opacity-90"
            >
              View all products
              <span className="material-symbols-outlined text-lg">east</span>
            </Link>
          </div>
        </div>
      </section>

      {children}
    </main>
  );
}
