import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy";

function positiveInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback;
  }

  return Math.min(parsed, maximum);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = positiveInteger(url.searchParams.get("page"), 0, 10_000);
  const size = positiveInteger(url.searchParams.get("size"), 10, 50) || 10;

  return proxyAuthenticatedBackend(`/orders?page=${page}&size=${size}`);
}
