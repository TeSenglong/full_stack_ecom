export default function StaffDashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 px-4 py-6 lg:px-6">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-8 w-56 rounded bg-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-80 rounded-xl bg-muted" />
    </div>
  )
}
