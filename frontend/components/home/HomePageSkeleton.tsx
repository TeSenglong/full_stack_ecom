import ProductSkeleton from "@/components/products/ProductSkeleton";

export default function HomePageSkeleton() {
  return (
    <div className="min-h-screen space-y-10 bg-surface p-6">
      <div className="h-72 w-full animate-pulse rounded-2xl bg-outline-variant/30" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-10 w-28 shrink-0 animate-pulse rounded-full bg-outline-variant/30" />
        ))}
      </div>
      <div>
        <div className="mb-6 h-8 w-48 animate-pulse rounded bg-outline-variant/40" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <ProductSkeleton key={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
