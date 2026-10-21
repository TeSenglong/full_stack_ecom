import "server-only";

import { getProductsUrl, parseApiResponse } from "@/lib/api/product-api/shared";
import type { Product, ProductCatalog, ProductPage } from "@/types/product";

const PRODUCT_DETAILS_TIMEOUT_MS = 5_000;
const PRODUCT_LIST_TIMEOUT_MS = 30_000;
const STOREFRONT_CATALOG_TIMEOUT_MS = 90_000;
const ALL_PRODUCTS_PAGE_SIZE = 100;
const ALL_PRODUCTS_MAX_ATTEMPTS = 3;
const ALL_PRODUCTS_RETRY_DELAY_MS = 2_000;

export interface ProductPageFilters {
  query?: string;
  category?: string;
  sort?: string;
}

function createPageParams(
  page: number,
  size: number,
  filters: ProductPageFilters,
): URLSearchParams {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (filters.query?.trim()) params.set("q", filters.query.trim());
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.sort?.trim()) params.set("sort", filters.sort.trim());

  return params;
}

async function requestProductPage(
  page: number,
  size: number,
  filters: ProductPageFilters = {},
): Promise<ProductPage> {
  const params = createPageParams(page, size, filters);
  const response = await fetch(`${getProductsUrl()}?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(PRODUCT_LIST_TIMEOUT_MS),
  });

  return parseApiResponse<ProductPage>(response, "Failed to fetch products");
}

export async function getProductCatalog(
  page = 0,
  size = 12,
  filters: ProductPageFilters = {},
): Promise<ProductCatalog> {
  const params = createPageParams(page, size, filters);
  const response = await fetch(`${getProductsUrl()}/catalog?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(STOREFRONT_CATALOG_TIMEOUT_MS),
  });

  return parseApiResponse<ProductCatalog>(
    response,
    "Failed to fetch the product catalog",
  );
}

export async function getProductPage(
  page = 0,
  size = 20,
  filters: ProductPageFilters = {},
): Promise<ProductPage> {
  return requestProductPage(page, size, filters);
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`${getProductsUrl()}/${encodeURIComponent(id)}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(PRODUCT_DETAILS_TIMEOUT_MS),
  });

  return parseApiResponse<Product>(response, "Failed to fetch product");
}

async function requestAllProducts(): Promise<Product[]> {
  const firstPage = await requestProductPage(0, ALL_PRODUCTS_PAGE_SIZE);

  if (firstPage.totalPages <= 1) {
    return firstPage.content;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      requestProductPage(index + 1, ALL_PRODUCTS_PAGE_SIZE),
    ),
  );

  return [
    ...firstPage.content,
    ...remainingPages.flatMap((page) => page.content),
  ];
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

// Used by the home and search pages. The storefront catalog above never retries.
export async function getProducts(): Promise<Product[]> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= ALL_PRODUCTS_MAX_ATTEMPTS; attempt++) {
    try {
      return await requestAllProducts();
    } catch (error) {
      lastError = error;

      if (attempt < ALL_PRODUCTS_MAX_ATTEMPTS) {
        await wait(ALL_PRODUCTS_RETRY_DELAY_MS);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to load products");
}
