export default function SearchLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-surface">
      <section className="border-b border-outline/15 bg-surface-low">
        <div className="mx-auto max-w-350 px-5 py-10 md:px-8 md:py-14 lg:px-12">
          <div className="h-3 w-36 rounded bg-outline-variant/40" />
          <div className="mt-4 h-10 w-72 max-w-full rounded bg-outline-variant/40" />
          <div className="mt-4 h-5 w-96 max-w-full rounded bg-outline-variant/30" />
          <div className="mt-7 h-14 max-w-3xl rounded-xl bg-surface-lowest" />
        </div>
      </section>
      <section className="mx-auto grid max-w-350 grid-cols-1 gap-6 px-5 py-10 sm:grid-cols-2 md:px-8 lg:grid-cols-4 lg:px-12">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="aspect-3/4 rounded-xl bg-outline-variant/25"
          />
        ))}
      </section>
    </main>
  );
}
