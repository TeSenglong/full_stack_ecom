import { NextResponse } from "next/server";

import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy";
import { rejectInvalidCsrfOrigin } from "@/lib/security/csrf";

interface CartItemRouteContext {
  params: Promise<{ id: string }>;
}

async function cartItemPath(context: CartItemRouteContext) {
  const { id } = await context.params;

  if (!/^\d+$/.test(id)) {
    return null;
  }

  return `/cart/items/${id}`;
}

export async function PUT(request: Request, context: CartItemRouteContext) {
  const csrfFailure = rejectInvalidCsrfOrigin(request);
  if (csrfFailure) return csrfFailure;

  const path = await cartItemPath(context);

  if (!path) {
    return NextResponse.json({ message: "Invalid cart item" }, { status: 400 });
  }

  return proxyAuthenticatedBackend(path, {
    method: "PUT",
    body: await request.text(),
  });
}

export async function DELETE(
  request: Request,
  context: CartItemRouteContext,
) {
  const csrfFailure = rejectInvalidCsrfOrigin(request);
  if (csrfFailure) return csrfFailure;

  const path = await cartItemPath(context);

  if (!path) {
    return NextResponse.json({ message: "Invalid cart item" }, { status: 400 });
  }

  return proxyAuthenticatedBackend(path, { method: "DELETE" });
}
