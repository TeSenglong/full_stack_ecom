export default function AdminOrderLoading() {
  return (
    <div className="animate-pulse space-y-6 px-4 py-6 lg:px-6">
      <div className="h-5 w-32 rounded bg-muted" />
      <div className="space-y-3 border-b pb-6">
        <div className="h-5 w-40 rounded bg-muted" />
        <div className="h-9 w-72 max-w-full rounded bg-muted" />
        <div className="h-4 w-56 rounded bg-muted" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="h-96 rounded-xl bg-muted" />
          <div className="h-52 rounded-xl bg-muted" />
        </div>
        <div className="space-y-6">
          <div className="h-56 rounded-xl bg-muted" />
          <div className="h-56 rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  )
}
