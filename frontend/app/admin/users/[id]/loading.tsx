export default function AdminUserLoading() {
  return (
    <div className="animate-pulse space-y-6 px-4 py-6 lg:px-6">
      <div className="h-5 w-28 rounded bg-muted" />
      <div className="flex items-center gap-5 border-b pb-6">
        <div className="size-16 rounded-full bg-muted" />
        <div className="space-y-3">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-8 w-64 max-w-full rounded bg-muted" />
          <div className="h-4 w-52 rounded bg-muted" />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="h-96 rounded-xl bg-muted" />
        <div className="h-96 rounded-xl bg-muted" />
      </div>
    </div>
  )
}
