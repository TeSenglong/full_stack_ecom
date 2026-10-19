export default function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-outline/20 bg-surface-container p-3 sm:p-4">
      <div className="mb-4 aspect-square w-full rounded-md bg-outline-variant/30" />
      <div className="mb-2 h-3 w-1/4 rounded bg-outline-variant/30" />
      <div className="mb-3 h-5 w-3/4 rounded bg-outline-variant/40" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-6 w-1/3 rounded bg-outline-variant/40" />
        <div className="h-9 w-10 rounded-md bg-outline-variant/30 sm:w-24" />
      </div>
    </div>
  );
}
