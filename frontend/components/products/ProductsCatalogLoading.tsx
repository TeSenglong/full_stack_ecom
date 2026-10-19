import ProductSkeleton from "@/components/products/ProductSkeleton";

export default function ProductsCatalogLoading() {
  return (
    <section
      id="catalog-results"
      className="mx-auto max-w-350 scroll-mt-24 px-5 py-12 md:px-8 lg:px-12"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mb-8 rounded-lg border border-outline/15 bg-surface-lowest px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="mt-1 size-2.5 shrink-0 animate-pulse rounded-full bg-secondary" aria-hidden="true" />
          <div>
            <p className="font-serif text-xl font-semibold text-primary">Starting the catalog…</p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              Our server may take about a minute to wake up.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }, (_, index) => <ProductSkeleton key={index} />)}
      </div>
    </section>
  );
}
