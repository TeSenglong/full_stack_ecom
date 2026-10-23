"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import AOS from "aos";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "@/components/products/ProductCard";
import ProductSkeleton from "@/components/products/ProductSkeleton";
import type { Category, ProductPage } from "@/types/product";
import { useLanguage } from "@/app/provider/languageProvider";

interface ProductShowcaseProps {
  productPage: ProductPage | null;
  categories: Category[];
  selectedCategory: string;
}

export default function ProductShowcase({
  productPage,
  categories,
  selectedCategory,
}: ProductShowcaseProps) {
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const { language, messages } = useLanguage();
  const text = messages.home.featured;
  const products = productPage?.content ?? [];
  const currentPage = (productPage?.page ?? 0) + 1;
  const availableFilters = [
    { key: "all", label: text.allProducts },
    ...categories.map((category) => ({
      key: category.name,
      label: category.name,
    })),
  ];

  // Navigating requests a new backend page instead of filtering the first 10 products.
  function navigateTo(category: string, page = 1) {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    const href = query ? `/?${query}#bestsellers` : "/#bestsellers";
    startTransition(() => router.push(href, { scroll: false }));
  }

  const catalogParams = new URLSearchParams({ sort: "newest" });
  if (selectedCategory !== "all") catalogParams.set("category", selectedCategory);

  return (
    <section
      id="bestsellers"
      aria-busy={isNavigating}
      className="mx-auto max-w-350 px-5 py-24 md:px-8 lg:px-12"
    >
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-[13px] uppercase tracking-[0.08em] text-secondary">{text.eyebrow}</span>
          <h2 className="mt-1 font-serif text-[32px] font-semibold text-primary">{text.title}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{text.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableFilters.map((filter) => {
            const active = selectedCategory === filter.key;
            return (
              <button
                type="button"
                key={filter.key}
                onClick={() => navigateTo(filter.key)}
                disabled={isNavigating}
                aria-pressed={active}
                className={`cursor-pointer rounded px-4 py-2 text-[12px] uppercase tracking-[0.06em] transition-colors disabled:cursor-wait disabled:opacity-50 ${
                  active ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"
                }`}
              >
                <span
                  lang={filter.key === "all" ? (language === "kh" ? "km" : "en") : "en"}
                  className={filter.key === "all" ? undefined : "catalog-content"}
                >{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isNavigating ? (
        <div role="status">
          <p className="sr-only">{text.loadingProducts}</p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <ProductSkeleton key={item} />)}
          </div>
        </div>
      ) : !productPage ? (
        <div className="py-20 text-center" role="alert">
          <p className="text-lg font-medium text-primary">{text.loadError}</p>
          <button
            type="button"
            onClick={() => startTransition(() => router.refresh())}
            className="mt-4 cursor-pointer rounded bg-primary px-6 py-2 text-[13px] font-medium uppercase text-on-primary"
          >
            {text.retry}
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-primary">{text.empty}</p>
          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => navigateTo("all")}
              className="mt-4 cursor-pointer rounded bg-primary px-6 py-2 text-[13px] font-medium uppercase text-on-primary"
            >
              {text.showAll}
            </button>
          )}
        </div>
      ) : (
        <Swiper
          key={`${selectedCategory}:${currentPage}`}
          modules={[Pagination, Autoplay]}
          onAfterInit={() => requestAnimationFrame(() => AOS.refresh())}
          onResize={() => requestAnimationFrame(() => AOS.refresh())}
          spaceBetween={24}
          slidesPerView={2}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="px-1! pb-14!"
        >
          {products.map((product) => {
            const category = typeof product.category === "string"
              ? product.category
              : product.category?.name;
            const salePrice = product.discountPrice != null && product.discountPrice < product.price
              ? product.discountPrice
              : product.price;
            const hasDiscount = salePrice < product.price;

            return (
              <SwiperSlide key={product.id} className="flex h-auto justify-center">
                <div
                  data-aos="fade-up"
                  data-aos-once="false"
                  suppressHydrationWarning
                  className="flex h-full w-full justify-center"
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    category={category || text.collection}
                    categoryLanguage={category ? "en" : language}
                    image={product.imageUrl || "https://placehold.co/600x600/FBF9F6/14213D?text=Product"}
                    rating={product.averageRating}
                    reviewCount={product.reviewCount}
                    price={salePrice}
                    originalPrice={hasDiscount ? product.price : undefined}
                    stockQuantity={product.stockQuantity}
                    badge={hasDiscount ? messages.productCard.sale : undefined}
                    labels={messages.productCard}
                    language={language}
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
      {productPage && productPage.totalPages > 1 && (
        <nav
          aria-label={text.paginationLabel}
          className="mt-6 flex items-center justify-between gap-3 border-t border-primary/15 pt-6"
        >
          <button
            type="button"
            disabled={productPage.first || isNavigating}
            onClick={() => navigateTo(selectedCategory, currentPage - 1)}
            className="cursor-pointer rounded-md border border-primary/15 px-4 py-2 text-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            {text.previous}
          </button>
          <p className="text-center text-sm text-on-surface-variant" aria-live="polite">
            {text.page} {currentPage} {text.of} {productPage.totalPages}
          </p>
          <button
            type="button"
            disabled={productPage.last || isNavigating}
            onClick={() => navigateTo(selectedCategory, currentPage + 1)}
            className="cursor-pointer rounded-md border border-primary/15 px-4 py-2 text-sm font-medium text-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            {text.next}
          </button>
        </nav>
      )}
      <div className="mt-2 text-center">
        <Link
          href={`/products?${catalogParams}`}
          className="inline-flex items-center gap-2 rounded-md border border-primary/15 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-low"
        >
          {text.viewAll}
          <span className="material-symbols-outlined text-lg">east</span>
        </Link>
      </div>
    </section>
  );
}
