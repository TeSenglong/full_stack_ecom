"use client";

import Image from "next/image";
import Link from "next/link";
import HeroReveal from "@/components/home/HeroReveal";
import { useLanguage } from "@/app/provider/languageProvider";

export default function AboutHero() {
  const { messages } = useLanguage();
  const text = messages.about.hero;

  return (
    <section className="mx-auto max-w-350 px-5 pb-20 pt-10 md:px-8 lg:px-12">
      <div className="grid min-h-165 overflow-hidden rounded-xl bg-brand-panel lg:grid-cols-2">
        <div className="flex flex-col justify-center px-7 py-14 text-on-brand md:px-14 lg:px-16">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-brand-accent" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-accent">{text.eyebrow}</span>
          </div>
          <h1 className="max-w-xl font-serif text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">{text.title}</h1>
          <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-on-brand/80">{text.description}</p>
          <HeroReveal className="mt-9 flex flex-wrap gap-4 [animation-delay:200ms]">
            <Link href="/products" className="rounded bg-secondary px-6 py-3 text-sm font-semibold text-on-secondary">{text.exploreProducts}</Link>
            <a href="#story" className="flex items-center gap-2 px-2 py-3 text-sm font-semibold">{text.readStory} <span className="material-symbols-outlined text-[17px]">south</span></a>
          </HeroReveal>
        </div>
        <div className="relative min-h-120 bg-primary-container lg:min-h-full">
          <Image
            src="https://lzfudmcajnsccibezqgb.supabase.co/storage/v1/object/public/image/profile-cover.jpg"
            alt={text.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            loading="eager"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary/50 via-transparent to-transparent" />
          <HeroReveal className="[animation-delay:400ms] absolute bottom-7 left-7 right-7 rounded bg-surface-lowest/90 p-5 text-primary shadow-xl backdrop-blur-sm md:left-auto md:max-w-sm">
            <p className="font-serif text-xl font-semibold">{text.imageTitle}</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-on-surface-variant">{text.imageDescription}</p>
          </HeroReveal>
        </div>
      </div>
    </section>
  );
}
