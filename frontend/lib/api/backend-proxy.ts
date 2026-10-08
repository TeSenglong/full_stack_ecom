import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function proxyAuthenticatedBackend(
  path: string,
  init: RequestInit = {},
) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { message: "BACKEND_URL is not configured" },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Please log in to continue" },
      { status: 401 },
    );
  }

  try {
    const isMultipart = init.body instanceof FormData;
    const backendResponse = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body && !isMultipart
          ? { "Content-Type": "application/json" }
          : {}),
        ...init.headers,
      },
      cache: "no-store",
    });

    const responseBody = await backendResponse.text();

    if (backendResponse.status === 401) {
      cookieStore.delete("access_token");
    }

    if (backendResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(responseBody || null, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the store service" },
      { status: 503 },
    );
  }
}
