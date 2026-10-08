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

  const backendResponse = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const data = await backendResponse.json();

  return NextResponse.json(data, {
    status: backendResponse.status,
  });
}
