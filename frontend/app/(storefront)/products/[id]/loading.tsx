export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-6 py-16 md:px-12">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square rounded-xl bg-primary/5" />
        <div className="space-y-4">
          <div className="h-3 w-24 rounded bg-primary/10" />
          <div className="h-8 w-3/4 rounded bg-primary/10" />
          <div className="h-6 w-32 rounded bg-primary/10" />
          <div className="h-24 w-full rounded bg-primary/5" />
        </div>
      </div>
    </div>
  );
}
