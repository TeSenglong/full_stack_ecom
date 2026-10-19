export default function AccountLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-52 rounded-xl bg-surface-low" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-36 rounded-xl bg-surface-low" />
        <div className="h-36 rounded-xl bg-surface-low" />
        <div className="h-36 rounded-xl bg-surface-low" />
      </div>
      <div className="h-72 rounded-xl bg-surface-low" />
    </div>
  );
}
