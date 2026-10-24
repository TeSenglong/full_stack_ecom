"use client";

import Link from "next/link";
import { ChevronDown, Mail, MessageCircle } from "lucide-react";
import { useId, useState } from "react";
import type { SVGProps } from "react";
import { useLanguage } from "@/app/provider/languageProvider";

const FOOTER_LINKS = [
  ["/products?sort=newest", "/products", "/categories", "/products", "/products", "/products"],
  ["/about", "/about#story", "/about#values", "/products"],
  ["#", "#", "#", "#"],
  ["#", "#", "#", "https://github.com/TeSenglong"],
];
function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V13h2.8v8h3.4z" />
    </svg>
  );
}

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.82.57A12 12 0 0 0 12 .5z" />
    </svg>
  );
}

const CONTACT_ICONS = [FacebookIcon, Mail, MessageCircle, GithubIcon];

function FooterLinkColumn({
  title,
  labels,
  hrefs,
  isContact,
}: {
  title: string;
  labels: string[];
  hrefs: string[];
  isContact: boolean;
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
          <span className="flex items-center gap-2">
            {isContact && <Mail aria-hidden="true" className="size-4" />}
            {title}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`size-4 shrink-0 motion-safe:transition-transform motion-safe:duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        <span className="hidden items-center gap-2 xl:flex">
          {isContact && <Mail aria-hidden="true" className="size-4" />}
          {title}
        </span>
      </h5>
      <div id={panelId} className={`${isOpen ? "block" : "hidden"} pb-5 xl:block xl:pb-0`}>
        <ul className={isContact
          ? "grid grid-cols-4 gap-2 text-[13px] text-on-surface-variant"
          : "space-y-2 text-[13px] text-on-surface-variant"}
        >
          {labels.map((label, linkIndex) => {
            const Icon = CONTACT_ICONS[linkIndex];

            return (
              <li key={linkIndex}>
                <Link
                  href={hrefs[linkIndex]}
                  prefetch={hrefs[linkIndex].startsWith("/about") ? false : undefined}
                  target={isContact && /^https?:\/\//.test(hrefs[linkIndex]) ? "_blank" : undefined}
                  rel={isContact && /^https?:\/\//.test(hrefs[linkIndex]) ? "noopener noreferrer" : undefined}
                  aria-label={isContact ? label : undefined}
                  title={isContact ? label : undefined}
                  className={isContact
                    ? "contact-icon-shine relative isolate flex size-11 items-center justify-center overflow-hidden rounded-sm bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-high hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    : "inline-flex min-h-9 items-center rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary xl:min-h-0"}
                >
                  {isContact && Icon
                    ? <Icon aria-hidden="true" className="size-5" />
                    : label}
                </Link>
              </li>
            );
          })}
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
              className="shrink-0 cursor-pointer rounded bg-secondary px-6 py-3 text-[13px] font-medium uppercase tracking-[0.08em] text-on-secondary transition-opacity hover:opacity-90"
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
              isContact={columnIndex === 3}
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
