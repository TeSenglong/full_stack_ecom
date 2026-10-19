import type { Metadata } from "next";

import CustomerOrderHistory from "@/components/account/CustomerOrderHistory";

export const metadata: Metadata = {
  title: "My Orders | MOHAORI",
  description: "Review and track your MOHAORI orders.",
};

export default function CustomerOrdersPage() {
  return (
    <section className="rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8">
      <div className="mb-7 border-b border-primary/10 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
          Purchases
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-primary">
          Order history
        </h2>
        <p className="mt-2 text-on-surface-variant">
          Review your purchases, totals, and current delivery status.
        </p>
      </div>
      <CustomerOrderHistory />
    </section>
  );
}
