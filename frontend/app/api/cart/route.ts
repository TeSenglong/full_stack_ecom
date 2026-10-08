import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy";

export async function GET() {
  return proxyAuthenticatedBackend("/cart");
}

export async function DELETE() {
  return proxyAuthenticatedBackend("/cart", { method: "DELETE" });
}
