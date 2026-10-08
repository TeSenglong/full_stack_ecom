import "server-only";
import { getBackendUrl } from "@/lib/api/backend-url";
import type { NewProduct, Product, ProductPage } from "@/types/product";
import { cookies } from "next/headers";

const API_TIMEOUT_MS = 5_000;

function getProductsUrl() {
  return `${getBackendUrl()}/products`;
}

async function parseResponse<T>(response: Response, message: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${message} (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(getProductsUrl(), {
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  const page = await parseResponse<ProductPage>(
    response,
    "Failed to fetch products",
  );

  return page.content;
}

export async function getProductPage(
  page = 0,
  size = 20,
): Promise<ProductPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const response = await fetch(`${getProductsUrl()}?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(API_TIMEOUT_MS),
  });

  return parseResponse<ProductPage>(response, "Failed to fetch products");
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
