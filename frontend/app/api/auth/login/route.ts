import type { AuthResponse } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";
import { rejectInvalidCsrfOrigin } from "@/lib/security/csrf";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request: Request) {
  const csrfFailure = rejectInvalidCsrfOrigin(request);
  if (csrfFailure) return csrfFailure;

  if (!BACKEND_URL) {
    return NextResponse.json(
      { message: "BACKEND_URL is not configured" },
      { status: 500 },
    );
  }

  const body = await request.json();

  const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  }

  const auth = data as AuthResponse;

  const response = NextResponse.json({
    user: auth.user,
  });

  response.cookies.set("access_token", auth.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: auth.expiresIn,
  });

  return response;
}
