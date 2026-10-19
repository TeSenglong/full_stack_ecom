import "server-only";

import { redirect, unstable_rethrow } from "next/navigation";
import ProductsCatalog from "@/components/products/ProductsCatalog";
import { getProductCatalog } from "@/lib/api/products";
import type { ProductCatalog, ProductPage } from "@/types/product";

const PRODUCTS_PER_PAGE = 12;
const CATALOG_SORTS = new Set([
  "featured",
  "newest",
  "price-low",
  "price-high",
  "name",
]);

export interface ProductsSearchParams {
  q?: string | string[];
  category?: string | string[];
  sort?: string | string[];
  page?: string | string[];
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function pageNumber(value?: string | string[]) {
  const parsed = Number.parseInt(firstValue(value) ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function catalogHref(
  search: string,
  category: string,
  sort: string,
  page: number,
) {
  const params = new URLSearchParams();

  if (search.trim()) params.set("q", search.trim());
  if (category !== "all") params.set("category", category);
  if (sort !== "featured") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

function emptyProductPage(page: number): ProductPage {
  return {
    page: page - 1,
    content: [],
    size: PRODUCTS_PER_PAGE,
    totalContents: 0,
    totalPages: 0,
    first: true,
    last: true,
  };
}

export default async function ProductsCatalogData({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  const query = await searchParams;
  const initialSearch = firstValue(query.q) ?? "";
  const initialCategory = firstValue(query.category) ?? "all";
  const requestedSort = firstValue(query.sort) ?? "featured";
  const initialSort = CATALOG_SORTS.has(requestedSort) ? requestedSort : "featured";
  const requestedPage = pageNumber(query.page);
  let catalog: ProductCatalog | null = null;

  try {
    catalog = await getProductCatalog(requestedPage - 1, PRODUCTS_PER_PAGE, {
      query: initialSearch,
      category: initialCategory === "all" ? undefined : initialCategory,
      sort: initialSort,
    });
  } catch (error) {
    unstable_rethrow(error);
    console.warn("Unable to load the product catalog:", error);
  }

  if (!catalog) {
    return (
      <ProductsCatalog
        productPage={emptyProductPage(requestedPage)}
        initialSearch={initialSearch}
        initialCategory={initialCategory}
        initialSort={initialSort}
        loadError
      />
    );
  }

  if (catalog.products.totalPages > 0 && requestedPage > catalog.products.totalPages) {
    redirect(catalogHref(
      initialSearch,
      initialCategory,
      initialSort,
      catalog.products.totalPages,
    ));
  }

  return (
    <ProductsCatalog
      key={`${initialSearch}:${initialCategory}:${initialSort}:${requestedPage}`}
      productPage={catalog.products}
      categoryOptions={catalog.categories}
      initialSearch={initialSearch}
      initialCategory={initialCategory}
      initialSort={initialSort}
    />
  );
}
