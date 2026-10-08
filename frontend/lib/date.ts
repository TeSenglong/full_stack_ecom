const productReleaseDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
})

export function isValidIsoDate(value?: string) {
  if (!value) return true
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const date = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  )
}

export function formatProductReleaseDate(value?: string | null) {
  if (!value || !isValidIsoDate(value)) return null
  return productReleaseDateFormatter.format(new Date(`${value}T00:00:00Z`))
}

export function productReleaseTimestamp(value?: string | null) {
  if (!value || !isValidIsoDate(value)) return 0
  return Date.parse(`${value}T00:00:00Z`)
}
