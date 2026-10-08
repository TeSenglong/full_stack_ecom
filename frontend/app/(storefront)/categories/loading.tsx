export default function CategoriesLoading() {
  return (
    <main className="min-h-screen bg-surface">
      <section className="border-b border-outline/15 bg-surface-low">
        <div className="mx-auto max-w-350 px-5 py-16 md:px-8 md:py-20 lg:px-12">
          <div className="max-w-3xl animate-pulse space-y-4">
            <div className="h-3 w-28 rounded bg-outline-variant/40" />
            <div className="h-14 w-4/5 rounded bg-outline-variant/50" />
            <div className="h-5 w-full max-w-2xl rounded bg-outline-variant/30" />
            <div className="h-11 w-40 rounded bg-outline-variant/40" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-350 px-5 py-16 md:px-8 lg:px-12">
        <div className="mb-9 animate-pulse space-y-3">
          <div className="h-9 w-64 rounded bg-outline-variant/40" />
          <div className="h-5 w-80 rounded bg-outline-variant/30" />
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
    </main>
  );
}
