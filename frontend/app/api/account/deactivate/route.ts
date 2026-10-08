import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy"

export async function PATCH(request: Request) {
  const response = await proxyAuthenticatedBackend("/account/deactivate", {
    method: "PATCH",
    body: await request.text(),
  })

  if (response.ok) {
    response.cookies.delete("access_token")
  }

  return response
}
