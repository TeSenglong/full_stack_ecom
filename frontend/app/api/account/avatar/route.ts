import { NextResponse } from "next/server";

import { proxyAuthenticatedBackend } from "@/lib/api/backend-proxy";
import { rejectInvalidCsrfOrigin } from "@/lib/security/csrf";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  const csrfFailure = rejectInvalidCsrfOrigin(request);
  if (csrfFailure) return csrfFailure;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { message: "Profile image is required" },
      { status: 400 },
    );
  }

  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "Profile image must be JPEG, PNG, or WebP" },
      { status: 400 },
    );
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return NextResponse.json(
      { message: "Profile image must not exceed 5 MB" },
      { status: 400 },
    );
  }

  const backendFormData = new FormData();
  backendFormData.set("file", file, file.name);

  return proxyAuthenticatedBackend("/account/avatar", {
    method: "POST",
    body: backendFormData,
  });
}

export async function DELETE(request: Request) {
  const csrfFailure = rejectInvalidCsrfOrigin(request);
  if (csrfFailure) return csrfFailure;

  return proxyAuthenticatedBackend("/account/avatar", {
    method: "DELETE",
  });
}
