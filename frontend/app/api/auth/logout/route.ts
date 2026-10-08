import { NextResponse } from "next/server";
import { rejectInvalidCsrfOrigin } from "@/lib/security/csrf";

export async function POST(request: Request) {
  const csrfFailure = rejectInvalidCsrfOrigin(request);
  if (csrfFailure) return csrfFailure;

  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  response.cookies.delete("access_token");

  return response;
}
