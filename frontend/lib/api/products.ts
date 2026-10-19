import "server-only";
import { getBackendUrl } from "@/lib/api/backend-url";
import type { NewProduct, Product, ProductCatalog, ProductPage } from "@/types/product";
import { cookies } from "next/headers";

const API_TIMEOUT_MS = 5_000;

const PRODUCT_LIST_TIMEOUT_MS = 30_000;
const PRODUCT_LIST_MAX_ATTEMPTS = 3;
const PRODUCT_LIST_RETRY_DELAY_MS = 2_000;
const PRODUCT_LIST_PAGE_SIZE = 100;
const STOREFRONT_CATALOG_TIMEOUT_MS = 90_000;

export interface ProductPageFilters {
  query?: string;
  category?: string;
  sort?: string;
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
function getProductsUrl() {
  return `${getBackendUrl()}/products`;
}

async function parseResponse<T>(response: Response, message: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${message} (${response.status})`);
  }

  return response.json() as Promise<T>;
}

async function requestProductPage(
  page: number,
  size: number,
  timeoutMs: number,
  filters: ProductPageFilters = {},
): Promise<ProductPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (filters.query?.trim()) params.set("q", filters.query.trim());
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.sort?.trim()) params.set("sort", filters.sort.trim());

  const response = await fetch(`${getProductsUrl()}?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });

  return parseResponse<ProductPage>(response, "Failed to fetch products");
}

export async function getProductCatalog(
  page = 0,
  size = 12,
  filters: ProductPageFilters = {},
): Promise<ProductCatalog> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (filters.query?.trim()) params.set("q", filters.query.trim());
  if (filters.category?.trim()) params.set("category", filters.category.trim());
  if (filters.sort?.trim()) params.set("sort", filters.sort.trim());

  const response = await fetch(`${getProductsUrl()}/catalog?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(STOREFRONT_CATALOG_TIMEOUT_MS),
  });

  return parseResponse<ProductCatalog>(response, "Failed to fetch the product catalog");
}

async function requestAllProducts(): Promise<Product[]> {
  const firstPage = await requestProductPage(
    0,
    PRODUCT_LIST_PAGE_SIZE,
    PRODUCT_LIST_TIMEOUT_MS,
  );

  if (firstPage.totalPages <= 1) {
    return firstPage.content;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      requestProductPage(
        index + 1,
        PRODUCT_LIST_PAGE_SIZE,
        PRODUCT_LIST_TIMEOUT_MS,
      ),
    ),
  );

  return [
    ...firstPage.content,
    ...remainingPages.flatMap((page) => page.content),
  ];
}

export async function getProducts(): Promise<Product[]> {
  let lastError: unknown;

  for (
    let attempt = 1;
    attempt <= PRODUCT_LIST_MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      return await requestAllProducts();
    } catch (error) {
      lastError = error;

      if (attempt < PRODUCT_LIST_MAX_ATTEMPTS) {
        await wait(PRODUCT_LIST_RETRY_DELAY_MS);
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to load products");
}

export async function getProductPage(
  page = 0,
  size = 20,
  filters: ProductPageFilters = {},
): Promise<ProductPage> {
  return requestProductPage(page, size, PRODUCT_LIST_TIMEOUT_MS, filters);
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`${getProductsUrl()}/${encodeURIComponent(id)}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });
  return parseResponse<Product>(response, "Failed to fetch product");
}



export async function createProduct(
  product: NewProduct
): Promise<Product> {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(getProductsUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  return parseResponse<Product>(
    response,
    "Failed to create product"
  );
}

export async function createProductWithImage(
  product: NewProduct,
  image: File,
): Promise<Product> {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    throw new Error("Authentication required");
  }

  const formData = new FormData();
  formData.set(
    "product",
    new Blob([JSON.stringify(product)], { type: "application/json" }),
  );
  formData.set("file", image, image.name);

  const response = await fetch(`${getProductsUrl()}/with-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });

  return parseResponse<Product>(
    response,
    "Failed to create product with image",
  );
}

export async function updateProduct(
  id: string,
  product: NewProduct,
): Promise<Product> {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${getProductsUrl()}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  return parseResponse<Product>(response, "Failed to update product");
}

export async function deleteProduct(id: string): Promise<void> {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    throw new Error("Authentication required");
  }

  const response = await fetch(`${getProductsUrl()}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product (${response.status})`);
  }
}
