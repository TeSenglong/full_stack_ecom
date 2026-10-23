import "server-only";

import { getBackendUrl } from "@/lib/api/backend-url";
import type { Product, ProductCatalog, ProductPage } from "@/types/product";

const REQUEST_TIMEOUT_MS = 90_000;
const RETRY_DELAY_MS = 1_000;
const MAX_REQUEST_ATTEMPTS = 2;
const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

export interface ProductPageFilters {
  query?: string;
  category?: string;
  sort?: string;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isRetryableNetworkError(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    (error instanceof DOMException && error.name === "TimeoutError")
  );
}

async function fetchBackend(
  url: string,
  errorMessage: string,
): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt++) {
    let response: Response;

    try {
      response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      if (attempt === MAX_REQUEST_ATTEMPTS || !isRetryableNetworkError(error)) {
        throw error;
      }

      await wait(RETRY_DELAY_MS);
      continue;
    }

    if (response.ok) return response;

    if (
      attempt < MAX_REQUEST_ATTEMPTS &&
      RETRYABLE_STATUS_CODES.has(response.status)
    ) {
      await wait(RETRY_DELAY_MS);
      continue;
    }

    throw new Error(`${errorMessage} (${response.status})`);
  }

  throw new Error(errorMessage);
}

// Fetch one page, optionally filtered by search, category, and sort.
export async function getProducts(
  page = 0,
  size = 20,
  filters: ProductPageFilters = {},
): Promise<ProductPage> {
  const API_URL = getBackendUrl();
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (filters.query?.trim()) params.set("q", filters.query.trim());
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.sort?.trim()) params.set("sort", filters.sort.trim());

  const response = await fetchBackend(
    `${API_URL}/products?${params}`,
    "Failed to fetch products",
  );
  return response.json();
}

// Fetch every matching page. Remaining pages load concurrently.
export async function getAllProducts(
  filters: ProductPageFilters = {},
): Promise<Product[]> {
  const firstPage = await getProducts(0, 100, filters);
  const requests: Promise<ProductPage>[] = [];

  for (let page = 1; page < firstPage.totalPages; page++) {
    requests.push(getProducts(page, 100, filters));
  }

  const remainingPages = await Promise.all(requests);

  return [
    ...firstPage.content,
    ...remainingPages.flatMap((page) => page.content),
  ];
}

// The storefront also needs category options from the catalog endpoint.
export async function getProductCatalog(
  page = 0,
  size = 12,
  filters: ProductPageFilters = {},
): Promise<ProductCatalog> {
  const API_URL = getBackendUrl();
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (filters.query?.trim()) params.set("q", filters.query.trim());
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.sort?.trim()) params.set("sort", filters.sort.trim());

  const response = await fetchBackend(
    `${API_URL}/products/catalog?${params}`,
    "Failed to fetch the product catalog",
  );
  return response.json();
}

export async function getProductById(id: string): Promise<Product> {
  const API_URL = getBackendUrl();
  const response = await fetchBackend(
    `${API_URL}/products/${encodeURIComponent(id)}`,
    "Failed to fetch product",
  );
  return response.json();
}
