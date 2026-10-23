export default function CategoriesCatalogLoading() {
  return (
    <section
      className="mx-auto max-w-350 px-5 py-16 md:px-8 lg:px-12"
      aria-busy="true"
      aria-label="Loading categories"
    >
      <div className="mb-9">
        <h2 className="font-serif text-3xl font-semibold text-primary md:text-4xl">
          Current categories
        </h2>
        <p className="mt-2 text-on-surface-variant">
          Select a category to see its available products.
        </p>
      </div>
      <div className="mb-8 rounded-lg border border-outline/15 bg-surface-lowest px-5 py-5 shadow-sm" role="status">
        <div className="flex items-start gap-3">
          <span className="mt-1 size-2.5 shrink-0 animate-pulse rounded-full bg-secondary" aria-hidden="true" />
          <div>
            <p className="font-serif text-xl font-semibold text-primary">Starting the categories…</p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              Our server may take about a minute to wake up.
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="animate-pulse overflow-hidden rounded-xl border border-primary/10 bg-surface-lowest"
          >
            <div className="aspect-4/3 bg-outline-variant/30" />
            <div className="space-y-3 p-6">
              <div className="h-3 w-24 rounded bg-outline-variant/30" />
              <div className="h-8 w-2/3 rounded bg-outline-variant/40" />
              <div className="h-4 w-full rounded bg-outline-variant/30" />
              <div className="h-4 w-4/5 rounded bg-outline-variant/30" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
