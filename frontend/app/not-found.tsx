import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-6 py-24 text-center">
      <p className="mb-2 font-serif text-3xl font-semibold text-primary">Artifact not found</p>
      <p className="mb-6 text-on-surface-variant">The product may have been removed or the address may be incorrect.</p>
      <Link href="/" className="rounded bg-primary px-5 py-3 text-sm font-medium text-on-primary">Return to the collection</Link>
    </div>
  );
}
