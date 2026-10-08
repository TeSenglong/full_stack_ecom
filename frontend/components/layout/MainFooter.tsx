"use client";

import Link from "next/link";

const FOOTER_COLUMNS = [
  { title: "Shop", links: [{ label: "New Releases", href: "/products?sort=newest" }, { label: "All Products", href: "/products" }, { label: "Furniture & Living", href: "/products" }, { label: "Tailored Apparel", href: "/products" }, { label: "Ceramics & Objects", href: "/products" }] },
  { title: "About", links: [{ label: "Our Philosophy", href: "/about" }, { label: "Our Story", href: "/about#story" }, { label: "Our Values", href: "/about#values" }, { label: "The Collection", href: "/products" }] },
  { title: "Client Services", links: [{ label: "Order Tracking", href: "#" }, { label: "Custom Commissions", href: "#" }, { label: "Care & Restoration", href: "#" }, { label: "Returns Policy", href: "#" }] },
  { title: "Sustainability", links: [{ label: "Material Provenance", href: "/about#values" }, { label: "Carbon Ledger", href: "#" }, { label: "Circular Repair", href: "/about#values" }, { label: "2024 Impact Dossier", href: "#" }] },
];

export default function MainFooter() {
  return (
    <footer className="w-full bg-surface-low text-on-surface">
      <div className="mx-auto max-w-350 px-5 pb-16 pt-24 md:px-8 lg:px-12">
        <div className="mb-24 flex flex-col gap-6 rounded bg-surface-container/60 p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="text-[11px] uppercase tracking-[0.12em] text-secondary">Exclusive Communiqué</span>
            <h3 className="mt-1 font-serif text-[26px] font-semibold text-primary">Join the Atelier Circle</h3>
            <p className="mt-1 text-[15px] text-on-surface-variant">
              Receive invitations to private collection vernissages and 10% off your introductory commission.
            </p>
          </div>
          <form
            onSubmit={(event) => event.preventDefault()}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              aria-label="Email address"
              placeholder="Enter your correspondence email"
              className="flex-1 rounded bg-surface-lowest px-4 py-3 text-[14px] text-on-surface outline-none"
            />
            <button
              type="submit"
              className="shrink-0 cursor-pointer rounded bg-primary px-6 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-on-primary transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <h4 className="mb-3 font-serif text-[22px] font-semibold text-primary">ATELIER &amp; CO.</h4>
            <p className="text-[13px] leading-relaxed text-on-surface-variant">
              An atelier committed to quiet timelessness, natural materiality, and architectural discipline. Every item is conceived as a tactile artifact for contemplative living.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h5 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">{column.title}</h5>
              <ul className="space-y-2 text-[13px] text-on-surface-variant">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition-opacity hover:opacity-70">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-high pt-6 text-[13px] text-on-surface-variant md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">public</span>
              <select aria-label="Country and currency" className="cursor-pointer bg-transparent text-[13px] outline-none">
                <option>United States (USD $)</option>
                <option>United Kingdom (GBP £)</option>
                <option>European Union (EUR €)</option>
                <option>Japan (JPY ¥)</option>
              </select>
            </div>
            <span className="opacity-40">|</span>
            <span>© {new Date().getFullYear()} Atelier &amp; Co. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-2">
            {["VISA", "MASTERCARD", "AMEX", "APPLE PAY"].map((card) => (
              <span key={card} className="rounded bg-surface-high px-2 py-1 text-[10px]">{card}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
