import type { CartItem, CartSummary } from "@/types/cart";

async function responseError(response: Response) {
  const data = await response.json().catch(() => null);
  return data?.message ?? data?.error ?? "Unable to update your cart";
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body
      ? { "Content-Type": "application/json", ...init.headers }
      : init?.headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const error = new Error(await responseError(response));
    error.name = response.status === 401 ? "AuthenticationError" : "CartError";
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getCart() {
  return request<CartSummary>("/api/cart");
}

export function addCartItem(productId: number, quantity: number) {
  return request<CartItem>("/api/cart/items", {
    method: "POST",
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateCartItem(cartItemId: number, quantity: number) {
  return request<CartItem>(`/api/cart/items/${cartItemId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(cartItemId: number) {
  return request<void>(`/api/cart/items/${cartItemId}`, {
    method: "DELETE",
  });
}

export function clearCart() {
  return request<void>("/api/cart", { method: "DELETE" });
}
