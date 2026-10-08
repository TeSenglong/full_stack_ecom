import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL?.trim().replace(/\/+$/, "");

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated" },
      { status: 401 },
    );
  }

  if (!BACKEND_URL) {
    return NextResponse.json(
      { message: "BACKEND_URL is not configured" },
      { status: 500 },
    );
  }

  let backendResponse: Response;

  try {
    backendResponse = await fetch(`${BACKEND_URL}/account`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach the store service" },
      { status: 503 },
    );
  }

  if (backendResponse.status === 401 || backendResponse.status === 403) {
    const response = NextResponse.json(
      { message: "Session expired" },
      { status: 401 },
    );

    response.cookies.delete("access_token");

    return response;
  }

  if (!backendResponse.ok) {
    const data = await backendResponse.json().catch(() => null);

    return NextResponse.json(
      { message: data?.message ?? "Unable to verify the current session" },
      { status: backendResponse.status },
    );
  }

  const user = await backendResponse.json();

  return NextResponse.json(user);
}
