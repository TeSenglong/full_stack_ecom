export default function AdminUsersLoading() {
  return (
    <div className="animate-pulse space-y-6 px-4 py-6 lg:px-6">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-8 w-52 rounded bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted" />
      </div>
      <div className="overflow-hidden rounded-xl border">
        <div className="h-20 border-b bg-muted/40" />
        <div className="h-16 border-b bg-muted/25" />
        <div className="h-72 bg-muted/15" />
      </div>
    </div>
  )
}
