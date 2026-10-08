export default function AccountLoading() {
  return (
    <main className="mx-auto min-h-[65vh] max-w-350 px-5 py-14 md:px-8 lg:px-12">
      <div className="h-12 w-64 animate-pulse rounded bg-surface-high" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr]">
        <div className="h-96 animate-pulse rounded-xl bg-surface-low" />
        <div className="h-96 animate-pulse rounded-xl bg-surface-low" />
      </div>
    </main>
  );
}
