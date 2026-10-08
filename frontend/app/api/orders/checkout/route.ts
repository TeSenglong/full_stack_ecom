import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy";

export async function POST(request: Request) {
  return proxyAuthenticatedBackend("/orders/checkout", {
    method: "POST",
    body: await request.text(),
  });
}
