"use client";

import Link from "next/link";
import { useState } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "@/components/products/ProductCard";
import type { ShowcaseProduct } from "@/types/product";

interface ProductShowcaseProps {
  products?: ShowcaseProduct[];
  filters?: { key: string; label: string }[];
  limit?: number;
}

export default function ProductShowcase({
  products = [],
  filters,
  limit = 10,
}: ProductShowcaseProps) {
  const productCategories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean)),
  ) as string[];
  const availableFilters = filters ?? [
    { key: "all", label: "All products" },
    ...productCategories.map((category) => ({
      key: category,
      label: category,
    })),
  ];
  const [activeFilter, setActiveFilter] = useState("all");

  const visibleProducts = products
    .filter(
      (product) =>
        activeFilter === "all" ||
        product.category?.toLowerCase() === activeFilter.toLowerCase(),
    )
    .slice(0, limit);

  return (
    <section id="bestsellers" className="mx-auto max-w-350 px-5 py-24 md:px-8 lg:px-12">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-[13px] uppercase tracking-[0.08em] text-secondary">Shop the catalog</span>
          <h2 className="mt-1 font-serif text-[32px] font-semibold text-primary">Featured products</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Browse products and add available items directly to your shopping bag.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {availableFilters.map((filter) => {
            const active = activeFilter === filter.key;
            return (
              <button
                type="button"
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`cursor-pointer rounded px-4 py-2 text-[12px] uppercase tracking-[0.06em] transition-colors ${
                  active ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium text-primary">No products found in this category.</p>
          {activeFilter !== "all" && (
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className="mt-4 cursor-pointer rounded bg-primary px-6 py-2 text-[13px] font-medium uppercase text-on-primary"
            >
              Show all products
            </button>
          )}
        </div>
      ) : (
        <Swiper
          modules={[Pagination, Autoplay]}
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
          {visibleProducts.map((product) => (
            <SwiperSlide key={product.id} className="flex h-auto justify-center">
              <ProductCard
                id={product.id}
                name={product.name}
                category={product.category || "Collection"}
                image={product.imageUrl}
                rating={product.rating}
                reviewCount={product.reviews}
                price={product.price}
                originalPrice={product.originalPrice}
                stockQuantity={product.stockQuantity}
                badge={typeof product.badge === "string" ? product.badge : product.badge?.label}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <div className="mt-2 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-md border border-primary/15 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-low"
        >
          View all products
          <span className="material-symbols-outlined text-lg">east</span>
        </Link>
      </div>
    </section>
  );
}
