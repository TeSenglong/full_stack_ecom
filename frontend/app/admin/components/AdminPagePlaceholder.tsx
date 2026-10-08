interface AdminPagePlaceholderProps {
  title: string
  description: string
}

export function AdminPagePlaceholder({
  title,
  description,
}: AdminPagePlaceholderProps) {
  return (
    <section className="px-4 py-6 lg:px-6">
      <div className="rounded-xl border bg-card p-8 shadow-xs">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Administration
        </p>
        <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </section>
  )
}
