import ProductSkeleton from "@/components/products/ProductSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-1400 px-5 py-16 md:px-8 lg:px-12">
      <div className="mb-12 animate-pulse">
        <div className="mb-4 h-3 w-28 rounded bg-outline-variant/40" />
        <div className="mb-4 h-12 w-72 rounded bg-outline-variant/40" />
        <div className="h-5 w-full max-w-xl rounded bg-outline-variant/30" />
      </div>
      <div className="mb-10 h-16 animate-pulse rounded-lg bg-surface-low" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <ProductSkeleton key={item} />)}
      </div>
    </main>
  );
}
