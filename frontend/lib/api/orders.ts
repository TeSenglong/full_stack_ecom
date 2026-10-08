import type { CheckoutRequest, Order, OrderPage } from "@/types/order";

async function responseError(response: Response) {
  const data = await response.json().catch(() => null);
  return data?.message ?? data?.error ?? "Unable to load your orders";
}

export async function checkout(information: CheckoutRequest): Promise<Order> {
  const response = await fetch("/api/orders/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(information),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      data?.message ?? data?.error ?? "Unable to complete your order",
    );
  }

  return response.json() as Promise<Order>;
}

export async function getCustomerOrders(page = 0, size = 10) {
  const response = await fetch(`/api/orders?page=${page}&size=${size}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  return response.json() as Promise<OrderPage>;
}

export async function getCustomerOrder(id: number) {
  const response = await fetch(`/api/orders/${id}`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  return response.json() as Promise<Order>;
}
