import { NextResponse } from "next/server";

import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy";

interface OrderRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: OrderRouteContext) {
  const { id } = await context.params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ message: "Invalid order" }, { status: 400 });
  }

  return proxyAuthenticatedBackend(`/orders/${id}`);
}
