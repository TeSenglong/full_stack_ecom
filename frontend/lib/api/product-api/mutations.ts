import "server-only";

import { getProductsUrl, parseApiResponse } from "@/lib/api/product-api/shared";
import type { NewProduct, Product } from "@/types/product";
import { cookies } from "next/headers";

const PRODUCT_MUTATION_TIMEOUT_MS = 5_000;
const PRODUCT_IMAGE_UPLOAD_TIMEOUT_MS = 20_000;

async function getAccessToken(): Promise<string> {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
}

export async function createProduct(product: NewProduct): Promise<Product> {
  const token = await getAccessToken();
  const response = await fetch(getProductsUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
    cache: "no-store",
    signal: AbortSignal.timeout(PRODUCT_MUTATION_TIMEOUT_MS),
  });

  return parseApiResponse<Product>(response, "Failed to create product");
}

export async function createProductWithImage(
  product: NewProduct,
  image: File,
): Promise<Product> {
  const token = await getAccessToken();
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
    signal: AbortSignal.timeout(PRODUCT_IMAGE_UPLOAD_TIMEOUT_MS),
  });

  return parseApiResponse<Product>(
    response,
    "Failed to create product with image",
  );
}

export async function updateProduct(
  id: string,
  product: NewProduct,
): Promise<Product> {
  const token = await getAccessToken();
  const response = await fetch(`${getProductsUrl()}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
    cache: "no-store",
    signal: AbortSignal.timeout(PRODUCT_MUTATION_TIMEOUT_MS),
  });

  return parseApiResponse<Product>(response, "Failed to update product");
}

export async function deleteProduct(id: string): Promise<void> {
  const token = await getAccessToken();
  const response = await fetch(`${getProductsUrl()}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(PRODUCT_MUTATION_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete product (${response.status})`);
  }
}
