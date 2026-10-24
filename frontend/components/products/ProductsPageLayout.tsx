import Link from "next/link";
import type { ReactNode } from "react";

export default function ProductsPageLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-surface">
      <section className="border-b border-outline/15 bg-surface-low">
        <div className="mx-auto max-w-350 px-5 py-16 md:px-8 lg:px-12">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">
            The Complete Edit
          </span>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-tight text-primary md:text-6xl">
            Objects selected for a quieter way of living.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">
            Browse enduring furniture, apparel, lighting, and crafted objects chosen for their material honesty and everyday usefulness.
          </p>
        </div>
      </section>

      {children}

      <section className="mx-auto max-w-350 px-5 pb-20 md:px-8 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg bg-brand-panel p-8 text-on-brand shadow-sm md:flex-row md:items-center md:p-12">
          <div>
            <span className="text-[11px] uppercase tracking-[0.12em] text-brand-accent">Our approach</span>
            <h2 className="mt-1 font-serif text-3xl font-semibold">Meet the hands behind the collection.</h2>
          </div>
          <Link href="/about" prefetch={false} className="rounded bg-secondary px-6 py-3 text-sm font-semibold text-on-secondary transition-colors hover:bg-secondary/90">
            Discover MOHAORI
          </Link>
        </div>
      </section>
    </main>
  );
}
