import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy";

export async function POST(request: Request) {
  return proxyAuthenticatedBackend("/cart/items", {
    method: "POST",
    body: await request.text(),
  });
}
