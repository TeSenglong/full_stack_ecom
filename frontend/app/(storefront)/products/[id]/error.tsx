"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="px-6 py-24 text-center">
      <p className="mb-2 font-medium text-red-700">Couldn&apos;t load this product.</p>
      <p className="mb-5 text-sm text-on-surface-variant">Please check that the product API is running and try again.</p>
      <button type="button" onClick={reset} className="cursor-pointer rounded bg-primary px-5 py-2.5 text-sm font-medium text-on-primary">Try again</button>
    </div>
  );
}
