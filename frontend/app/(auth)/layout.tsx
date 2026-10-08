

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-surface lg:grid-cols-2">
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 font-serif text-xl font-semibold text-primary"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="size-4" />
            </span>

            ATELIER &amp; CO.
          </Link>

          {children}
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-primary lg:flex">
        <div className="relative z-10 flex items-end p-16 text-primary-foreground">
          <h2 className="max-w-xl font-serif text-5xl leading-tight">
            Objects designed to make everyday moments feel intentional.
          </h2>
        </div>
      </section>
    </main>
  );
}