"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { useLanguage } from "@/app/provider/languageProvider";

const FOOTER_LINKS = [
  ["/products?sort=newest", "/products", "/categories", "/products", "/products", "/products"],
  ["/about", "/about#story", "/about#values", "/products"],
  ["#", "#", "#", "#"],
  ["/about#values", "#", "/about#values", "#"],
];

function FooterLinkColumn({
  title,
  labels,
  hrefs,
}: {
  title: string;
  labels: string[];
  hrefs: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-outline/20 xl:border-0">
      <h5 className="font-semibold text-primary xl:mb-3 xl:text-[11px] xl:uppercase xl:tracking-[0.08em]">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((open) => !open)}
          className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 rounded-sm py-4 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:hidden"
        >
          {title}
          <ChevronDown
            aria-hidden="true"
            className={`size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <span className="hidden xl:block">{title}</span>
      </h5>
      <div id={panelId} className={`${isOpen ? "block" : "hidden"} pb-5 xl:block xl:pb-0`}>
        <ul className="space-y-2 text-[13px] text-on-surface-variant">
          {labels.map((label, linkIndex) => (
            <li key={linkIndex}>
              <Link
                href={hrefs[linkIndex]}
                prefetch={hrefs[linkIndex].startsWith("/about") ? false : undefined}
                className="inline-flex min-h-9 items-center rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:min-h-0"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function MainFooter() {
  const { language, messages } = useLanguage();
  const text = messages.footer;

  return (
    <footer lang={language === "kh" ? "km" : "en"} className="localized-content w-full bg-surface-low text-on-surface">
      <div className="mx-auto max-w-350 px-5 pb-16 pt-24 md:px-8 lg:px-12">
        <div className="mb-24 flex flex-col gap-6 rounded bg-surface-container/60 p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="text-[11px] uppercase tracking-[0.12em] text-secondary">{text.eyebrow}</span>
            <h3 className="mt-1 font-serif text-[26px] font-semibold text-primary">{text.title}</h3>
            <p className="mt-1 text-[15px] text-on-surface-variant">
              {text.description}
            </p>
          </div>
          <form
            onSubmit={(event) => event.preventDefault()}
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              aria-label={text.emailLabel}
              placeholder={text.emailPlaceholder}
              className="flex-1 rounded bg-surface-lowest px-4 py-3 text-[14px] text-on-surface outline-none"
            />
            <button
              type="submit"
              className="shrink-0 cursor-pointer rounded bg-primary px-6 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-on-primary transition-opacity hover:opacity-90"
            >
              {text.subscribe}
            </button>
          </form>
        </div>

        <div className="mb-16 grid grid-cols-1 xl:grid-cols-5 xl:gap-8">
          <div className="mb-8 xl:mb-0">
            <h4 lang="en" className="mb-3 font-serif text-[22px] font-semibold text-primary">MOHAORI</h4>
            <p className="text-[13px] leading-relaxed text-on-surface-variant">
              {text.about}
            </p>
          </div>
          {text.columns.map((column, columnIndex) => (
            <FooterLinkColumn
              key={columnIndex}
              title={column.title}
              labels={column.links}
              hrefs={FOOTER_LINKS[columnIndex]}
            />
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-high pt-6 text-[13px] text-on-surface-variant md:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">public</span>
              <select aria-label={text.countryCurrency} className="cursor-pointer bg-transparent text-[13px] outline-none">
                {text.countries.map((country, index) => (
                  <option key={index} value={index}>{country}</option>
                ))}
              </select>
            </div>
            <span className="opacity-40">|</span>
            <span>© {new Date().getFullYear()} MOHAORI. {text.rights}</span>
          </div>
          <div className="flex items-center gap-2">
            {["VISA", "MASTERCARD", "AMEX", "APPLE PAY"].map((card) => (
              <span lang="en" key={card} className="catalog-content rounded bg-surface-high px-2 py-1 text-[10px]">{card}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
