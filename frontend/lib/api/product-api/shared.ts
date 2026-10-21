import "server-only";

import { getBackendUrl } from "@/lib/api/backend-url";

export function getProductsUrl(): string {
  return `${getBackendUrl()}/products`;
}

export async function parseApiResponse<T>(
  response: Response,
  message: string,
): Promise<T> {
  if (!response.ok) {
    throw new Error(`${message} (${response.status})`);
  }

  return response.json() as Promise<T>;
}
