import Image from "next/image";
import Link from "next/link";

export default function AboutHero() {
  return (
    <section className="mx-auto max-w-350 px-5 pb-20 pt-10 md:px-8 lg:px-12">
      <div className="grid min-h-165 overflow-hidden rounded-xl bg-brand-panel lg:grid-cols-2">
        <div className="flex flex-col justify-center px-7 py-14 text-on-brand md:px-14 lg:px-16">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#ffb59d]" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#ffb59d]">Self Initiated Project full-stack E-Commerce</span>
          </div>
          <h1 className="max-w-xl font-serif text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">Next JS, Spring Boot & Postgresql</h1>
          <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-on-brand/80">MOHAORI is a full-stack e-commerce platform built with Next JS, Spring Boot and PostgreSQL. It is a platform for buying and selling products.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/products" className="rounded bg-[#f4f0e9] px-6 py-3 text-sm font-semibold text-[#26332c]">Explore the production page</Link>
            <a href="#story" className="flex items-center gap-2 px-2 py-3 text-sm font-semibold">Read our story <span className="material-symbols-outlined text-[17px]">south</span></a>
          </div>
        </div>
        <div className="relative min-h-120 bg-primary-container lg:min-h-full">
          <Image
            src="https://lzfudmcajnsccibezqgb.supabase.co/storage/v1/object/public/image/profile-cover.jpg"
            alt="An artisan working carefully by hand"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            loading="eager"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-primary/50 via-transparent to-transparent" />
          <div className="absolute bottom-7 left-7 right-7 rounded bg-surface-lowest/90 p-5 text-primary shadow-xl backdrop-blur-sm md:left-auto md:max-w-sm">
            <p className="font-serif text-xl font-semibold">“Full-stack E-Commerce”</p>
            <p className="mt-2 text-xs uppercase tracking-widest text-on-surface-variant">I have no experience in real work so i make this full-stack project to learn how to build a real work project </p>
          </div>
        </div>
      </div>
    </section>
  );
}
