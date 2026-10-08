import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy";
import { rejectInvalidCsrfOrigin } from "@/lib/security/csrf";

export async function POST(request: Request) {
  const csrfFailure = rejectInvalidCsrfOrigin(request);
  if (csrfFailure) return csrfFailure;

  return proxyAuthenticatedBackend("/cart/items", {
    method: "POST",
    body: await request.text(),
  });
}
