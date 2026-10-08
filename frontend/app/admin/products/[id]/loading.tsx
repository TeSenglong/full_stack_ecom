export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 px-4 py-6 lg:px-6">
      <div className="h-5 w-32 rounded bg-muted" />
      <div className="space-y-3 border-b pb-6">
        <div className="h-5 w-44 rounded bg-muted" />
        <div className="h-9 w-2/3 rounded bg-muted" />
        <div className="h-4 w-56 rounded bg-muted" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="h-180 rounded-xl bg-muted" />
        <div className="space-y-6">
          <div className="aspect-square rounded-xl bg-muted" />
          <div className="h-64 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
