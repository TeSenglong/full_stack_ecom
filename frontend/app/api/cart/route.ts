import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy";
import { rejectInvalidCsrfOrigin } from "@/lib/security/csrf";

export async function GET() {
  return proxyAuthenticatedBackend("/cart");
}

export async function DELETE(request: Request) {
  const csrfFailure = rejectInvalidCsrfOrigin(request);
  if (csrfFailure) return csrfFailure;

  return proxyAuthenticatedBackend("/cart", { method: "DELETE" });
}
