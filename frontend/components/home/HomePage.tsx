"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, use } from "react";
import AOS from "aos";
import { A11y, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLanguage } from "@/app/provider/languageProvider";

import ProductShowcase from "@/components/home/ProductShowcase";
import HeroReveal from "@/components/home/HeroReveal";
import ProductSkeleton from "@/components/products/ProductSkeleton";
import ProgressiveImage from "@/components/products/ProgressiveImage";
import type { Category, ProductPage } from "@/types/product";

const SHOPPING_STEP_ICONS = [
  "search",
  "person",
  "add_shopping_cart",
  "receipt_long",
];

const FALLBACK_IMAGE =
  "https://lzfudmcajnsccibezqgb.supabase.co/storage/v1/object/public/image/Garments_arranged_on_dark_surface_20261008005847.jpg";
const HOME_HERO_IMAGE = "/home.jpg";

interface HomePageProps {
  productsPromise: Promise<ProductPage | null>;
  categoriesPromise: Promise<Category[]>;
  selectedCategory: string;
  requestedPage: number;
}

function HomeCategories({
  categoriesPromise,
}: {
  categoriesPromise: Promise<Category[]>;
}) {
  const { messages } = useLanguage();
  const text = messages.home.categories;
  const categories = use(categoriesPromise);

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/20 bg-surface-lowest px-6 py-14 text-center">
        <h3 className="font-serif text-2xl font-semibold text-primary">
          {text.emptyTitle}
        </h3>
        <p className="mt-2 text-on-surface-variant">{text.emptyDescription}</p>
      </div>
    );
  }

  return (
    <Swiper
      modules={[A11y, Keyboard, Pagination]}
      onAfterInit={() => requestAnimationFrame(() => AOS.refresh())}
      onResize={() => requestAnimationFrame(() => AOS.refresh())}
      spaceBetween={24}
      slidesPerView={1}
      slidesPerGroup={1}
      pagination={{ clickable: true }}
      keyboard={{ enabled: true, onlyInViewport: true }}
      breakpoints={{
        640: { slidesPerView: 2, slidesPerGroup: 2 },
        1024: { slidesPerView: 4, slidesPerGroup: 4 },
      }}
      className="px-1! pb-14!"
    >
      {categories.map((category) => (
        <SwiperSlide key={category.id} className="h-auto!">
          <div
            data-aos="fade-up"
            data-aos-once="false"
            suppressHydrationWarning
            className="h-full w-full"
          >
            <Link
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group block h-full overflow-hidden rounded-xl border border-primary/10 bg-surface-lowest shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <ProgressiveImage
                src={category.imageUrl || FALLBACK_IMAGE}
                alt={`${category.name} — ${text.collection}`}
                className="aspect-4/3 w-full transition-transform duration-500 group-hover:scale-105"
              />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                  {text.collection}
                </p>
                <h3
                  lang="en"
                  className="catalog-content mt-1 font-serif text-2xl font-semibold text-primary"
                >
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  {text.viewProducts}
                </p>
              </div>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function HomeCategoriesLoading() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="animate-pulse overflow-hidden rounded-xl border border-primary/10 bg-surface-lowest"
        >
          <div className="aspect-4/3 bg-outline-variant/30" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-20 rounded bg-outline-variant/30" />
            <div className="h-7 w-28 rounded bg-outline-variant/40" />
            <div className="h-4 w-40 rounded bg-outline-variant/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HomeProductShowcase({
  productsPromise,
  categoriesPromise,
  selectedCategory,
}: {
  productsPromise: Promise<ProductPage | null>;
  categoriesPromise: Promise<Category[]>;
  selectedCategory: string;
}) {
  const productPage = use(productsPromise);
  const categories = use(categoriesPromise);

  return (
    <ProductShowcase
      productPage={productPage}
      categories={categories}
      selectedCategory={selectedCategory}
    />
  );
}

function HomeProductShowcaseLoading() {
  const { messages } = useLanguage();
  const text = messages.home.featured;
  return (
    <section className="mx-auto max-w-350 px-5 py-24 md:px-8 lg:px-12">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-[13px] uppercase tracking-[0.08em] text-secondary">
            {text.eyebrow}
          </span>
          <h2 className="mt-1 font-serif text-[32px] font-semibold text-primary">
            {text.title}
          </h2>
          <p className="mt-2 text-sm text-on-surface-variant">{text.loading}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <ProductSkeleton key={item} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage({
  productsPromise,
  categoriesPromise,
  selectedCategory,
  requestedPage,
}: HomePageProps) {
  const { language, messages } = useLanguage();
  const { hero, categories, experience, cta } = messages.home;

  return (
    <div
      lang={language === "kh" ? "km" : "en"}
      className="localized-content w-full bg-surface font-sans text-on-surface antialiased"
    >
      <main className="w-full">
        <section className="mx-auto max-w-350 px-5 pb-14 pt-6 md:px-8 md:pb-20 md:pt-8 lg:px-12 lg:pb-24 lg:pt-10">
          <div className="grid items-stretch gap-12 lg:grid-cols-12">
            <div className="flex flex-col lg:col-span-6">
              <div className="mb-4 flex items-center gap-2 mt-10 md:mt-20 lg:mt-28">
                <span className="h-px w-8 bg-secondary" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  {hero.eyebrow}
                </span>
              </div>
              <h1 className="max-w-2xl font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-primary md:text-6xl">
                {hero.title}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
                {hero.description}
              </p>

              <HeroReveal className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-auto lg:pt-10">
                <Link
                  href="/products"
                  className="rounded-md bg-primary px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.07em] text-on-primary shadow-sm transition-opacity hover:opacity-90"
                >
                  {hero.shopProducts}
                </Link>
                <Link
                  href="/categories"
                  className="flex items-center justify-center gap-2 rounded-md border border-primary/15 bg-surface-low px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.07em] text-primary transition-colors hover:bg-surface-high"
                >
                  {hero.browseCategories}
                  <span className="material-symbols-outlined text-lg">
                    arrow_downward
                  </span>
                </Link>
              </HeroReveal>
            </div>

            <div className="lg:col-span-6">
              <Link
                href={"/products"}
                className="group relative block aspect-4/5 overflow-hidden rounded-2xl bg-surface-low shadow-xl"
              >
                <Image
                  src={HOME_HERO_IMAGE}
                  alt={hero.imageAlt}
                  fill
                  preload
                  sizes="(min-width: 1400px) 650px, (min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/5 to-transparent" />
                <HeroReveal className="absolute inset-x-0 bottom-0 p-7 text-white md:p-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
                    {hero.featuredCollection}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold">
                    {hero.exploreLatest}
                  </h2>
                </HeroReveal>
              </Link>
            </div>
          </div>
        </section>

        <section id="categories" className="bg-surface-low py-20">
          <div className="mx-auto max-w-350 px-5 md:px-8 lg:px-12">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  {categories.eyebrow}
                </span>
                <h2 className="mt-2 font-serif text-4xl font-semibold text-primary">
                  {categories.title}
                </h2>
                <p className="mt-3 max-w-2xl text-on-surface-variant">
                  {categories.description}
                </p>
              </div>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-70"
              >
                {categories.viewAll}
                <span className="material-symbols-outlined text-lg">east</span>
              </Link>
            </div>

            <Suspense fallback={<HomeCategoriesLoading />}>
              <HomeCategories categoriesPromise={categoriesPromise} />
            </Suspense>
          </div>
        </section>

        <Suspense
          key={`${selectedCategory}:${requestedPage}`}
          fallback={<HomeProductShowcaseLoading />}
        >
          <HomeProductShowcase
            productsPromise={productsPromise}
            categoriesPromise={categoriesPromise}
            selectedCategory={selectedCategory}
          />
        </Suspense>

        <section className="bg-brand-panel py-20 text-on-brand">
          <div
            data-aos="fade-up"
            data-aos-once="false"
            suppressHydrationWarning
            className="mx-auto max-w-350 px-5 md:px-8 lg:px-12"
          >
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ffb59d]">
                {experience.eyebrow}
              </span>
              <h2 className="mt-2 font-serif text-4xl font-semibold md:text-5xl">
                {experience.title}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-on-brand/75">
                {experience.description}
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {experience.steps.map((step, index) => (
                <article
                  key={SHOPPING_STEP_ICONS[index]}
                  className="rounded-xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-3xl text-[#ffb59d]">
                      {SHOPPING_STEP_ICONS[index]}
                    </span>
                    <span className="text-xs font-semibold text-white/45">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-brand/70">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-350 px-5 py-20 md:px-8 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-primary/10 bg-surface-low p-8 shadow-sm md:flex-row md:items-center md:p-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                {cta.eyebrow}
              </span>
              <h2 className="mt-2 max-w-2xl font-serif text-4xl font-semibold text-primary">
                {cta.title}
              </h2>
              <p className="mt-3 text-on-surface-variant">{cta.description}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/products"
                className="rounded-md bg-primary px-7 py-3 text-center text-sm font-semibold text-on-primary"
              >
                {cta.browseProducts}
              </Link>
              <Link
                href="/account"
                className="rounded-md border border-primary/15 px-7 py-3 text-center text-sm font-semibold text-primary hover:bg-surface-high"
              >
                {cta.myAccount}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
