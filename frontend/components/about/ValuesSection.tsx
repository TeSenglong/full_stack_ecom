"use client";

import Link from "next/link";
import { useLanguage } from "@/app/provider/languageProvider";

const VALUE_ICONS = ["school", "code", "dns", "rocket_launch"];

export default function ValuesSection() {
  const { messages } = useLanguage();
  const text = messages.about.journey;

  return (
    <section id="values" className="py-24">
      <div className="mx-auto max-w-350 px-5 md:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-secondary">{text.eyebrow}</span>
          <h2 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">{text.title}</h2>
          <p className="mt-5 text-[17px] leading-relaxed text-on-surface-variant">{text.description}</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {text.values.map((value, index) => (
            <article key={VALUE_ICONS[index]} className="group rounded-lg border border-outline/15 bg-surface-lowest p-7 transition-transform hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between"><span className="material-symbols-outlined text-3xl text-tertiary">{VALUE_ICONS[index]}</span><span className="font-serif text-sm text-outline">0{index + 1}</span></div>
              <h3 className="mt-8 font-serif text-2xl font-semibold text-primary">{value.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{value.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-7 rounded-xl bg-surface-high p-8 md:flex-row md:items-center md:p-12">
          <div className="max-w-2xl"><span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-secondary">{text.ctaEyebrow}</span><h2 className="mt-2 font-serif text-3xl font-semibold text-primary">{text.ctaTitle}</h2></div>
          <Link href="/products" className="shrink-0 rounded bg-secondary px-7 py-3.5 text-sm font-semibold text-on-secondary">{text.ctaButton}</Link>
        </div>
      </div>
    </section>
  );
}
