import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy"
import { rejectInvalidCsrfOrigin } from "@/lib/security/csrf"

export async function PATCH(request: Request) {
  const csrfFailure = rejectInvalidCsrfOrigin(request)
  if (csrfFailure) return csrfFailure

  const response = await proxyAuthenticatedBackend("/account/deactivate", {
    method: "PATCH",
    body: await request.text(),
  })

  if (response.ok) {
    response.cookies.delete("access_token")
  }

  return response
}
