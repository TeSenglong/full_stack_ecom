import Link from "next/link";

import ProductShowcase from "@/components/home/ProductShowcase";
import ProgressiveImage from "@/components/products/ProgressiveImage";
import type { ShowcaseProduct } from "@/types/product";

const STORE_FEATURES = [
  { icon: "inventory_2", label: "Live product availability" },
  { icon: "lock", label: "Secure customer accounts" },
  { icon: "shopping_bag", label: "Simple cart and checkout" },
  { icon: "local_shipping", label: "Order history and tracking" },
];

const SHOPPING_STEPS = [
  {
    icon: "search",
    title: "Explore the catalog",
    description:
      "Browse clothing, footwear, accessories, souvenirs, and new items added by the store team.",
  },
  {
    icon: "person",
    title: "Sign in securely",
    description:
      "Use your customer account to keep your shopping bag and orders connected to you.",
  },
  {
    icon: "add_shopping_cart",
    title: "Build your bag",
    description:
      "Choose the quantity you need while the storefront checks current stock and pricing.",
  },
  {
    icon: "receipt_long",
    title: "Checkout and review",
    description:
      "Place your order with delivery details, then review its status from your account.",
  },
];

const FALLBACK_IMAGE =
  "https://lzfudmcajnsccibezqgb.supabase.co/storage/v1/object/public/image/Garments_arranged_on_dark_surface_20261008005847.jpg";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function HomePage({ products }: { products: ShowcaseProduct[] }) {
  const categoryMap = new Map<
    string,
    { name: string; count: number; imageUrl: string }
  >();

  for (const product of products) {
    const categoryName = product.category?.trim() || "Other products";
    const existing = categoryMap.get(categoryName);

    if (existing) {
      existing.count += 1;
      if (!existing.imageUrl && product.imageUrl) {
        existing.imageUrl = product.imageUrl;
      }
    } else {
      categoryMap.set(categoryName, {
        name: categoryName,
        count: 1,
        imageUrl: product.imageUrl,
      });
    }
  }

  const categories = Array.from(categoryMap.values()).slice(0, 4);
  const inStockCount = products.filter(
    (product) => (product.stockQuantity ?? 0) > 0,
  ).length;
  const featuredProduct =
    products.find((product) => (product.stockQuantity ?? 0) > 0) ?? products[0];

  return (
    <div className="w-full bg-surface font-sans text-on-surface antialiased">
      <main className="w-full">

        <section className="mx-auto max-w-350 px-5 py-14 md:px-8 md:py-20 lg:px-12 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-px w-8 bg-secondary" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  The ATELIER &amp; CO. collection
                </span>
              </div>
              <h1 className="max-w-2xl font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-primary md:text-6xl">
                Everyday style, selected for you.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-surface-variant">
                Shop clothing, footwear, accessories, souvenirs, and everyday
                finds from one simple online catalog.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="rounded-md bg-primary px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.07em] text-on-primary shadow-sm transition-opacity hover:opacity-90"
                >
                  Shop all products
                </Link>
                <a
                  href="#categories"
                  className="flex items-center justify-center gap-2 rounded-md border border-primary/15 bg-surface-low px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.07em] text-primary transition-colors hover:bg-surface-high"
                >
                  Browse categories
                  <span className="material-symbols-outlined text-lg">
                    arrow_downward
                  </span>
                </a>
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-3 rounded-lg border border-outline/10 bg-surface-low p-4">
                <div>
                  <dt className="text-xs text-on-surface-variant">Products</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold text-primary">
                    {products.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-on-surface-variant">Categories</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold text-primary">
                    {categoryMap.size}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-on-surface-variant">In stock</dt>
                  <dd className="mt-1 font-serif text-2xl font-semibold text-secondary">
                    {inStockCount}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-6">
              <Link
                href={"/products"}
                className="group relative block aspect-4/5 overflow-hidden rounded-2xl bg-surface-low shadow-xl"
              >
                <ProgressiveImage
                  src={FALLBACK_IMAGE}
                  alt="ATELIER & CO. fashion collection"
                  className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/75">
                     Featured collection
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold">
                    Explore our latest products
                  </h2>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section id="categories" className="bg-surface-low py-20">
          <div className="mx-auto max-w-350 px-5 md:px-8 lg:px-12">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                  Shop your way
                </span>
                <h2 className="mt-2 font-serif text-4xl font-semibold text-primary">
                  Browse current categories
                </h2>
                <p className="mt-3 max-w-2xl text-on-surface-variant">
                  These collections are created from the products currently
                  available in the store.
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-70"
              >
                View the complete catalog
                <span className="material-symbols-outlined text-lg">east</span>
              </Link>
            </div>

            {categories.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    href={`/products?q=${encodeURIComponent(category.name)}`}
                    className="group overflow-hidden rounded-xl border border-primary/10 bg-surface-lowest shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <ProgressiveImage
                      src={category.imageUrl || FALLBACK_IMAGE}
                      alt={`${category.name} collection`}
                      className="aspect-4/3 w-full transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                        {category.count} {category.count === 1 ? "product" : "products"}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl font-semibold text-primary">
                        {category.name}
                      </h3>
                      <p className="mt-2 text-sm text-on-surface-variant">
                        View all products in this category.
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-primary/20 bg-surface-lowest px-6 py-14 text-center">
                <h3 className="font-serif text-2xl font-semibold text-primary">
                  Categories are coming soon
                </h3>
                <p className="mt-2 text-on-surface-variant">
                  New categories will appear here when products are added to the catalog.
                </p>
              </div>
            )}
          </div>
        </section>

        <ProductShowcase products={products} />

        <section className="bg-brand-panel py-20 text-on-brand">
          <div className="mx-auto max-w-350 px-5 md:px-8 lg:px-12">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#ffb59d]">
                A straightforward shopping experience
              </span>
              <h2 className="mt-2 font-serif text-4xl font-semibold md:text-5xl">
                From browsing to order history, everything stays connected.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-on-brand/75">
                The storefront uses live catalog data, customer accounts, a
                persistent shopping bag, stock-aware checkout, and personal order records.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SHOPPING_STEPS.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-3xl text-[#ffb59d]">
                      {step.icon}
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
                Ready to shop?
              </span>
              <h2 className="mt-2 max-w-2xl font-serif text-4xl font-semibold text-primary">
                Find something that fits your everyday.
              </h2>
              <p className="mt-3 text-on-surface-variant">
                Browse the catalog, sign in, and keep your cart and orders in one place.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/products"
                className="rounded-md bg-primary px-7 py-3 text-center text-sm font-semibold text-on-primary"
              >
                Browse products
              </Link>
              <Link
                href="/account"
                className="rounded-md border border-primary/15 px-7 py-3 text-center text-sm font-semibold text-primary hover:bg-surface-high"
              >
                My account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
