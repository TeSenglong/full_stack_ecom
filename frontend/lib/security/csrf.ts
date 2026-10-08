import "server-only";

import { NextResponse } from "next/server";

function forbiddenResponse() {
  return NextResponse.json(
    { message: "Request origin could not be verified" },
    { status: 403 },
  );
}

function parseOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function firstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

function requestOrigins(request: Request) {
  const origins = new Set<string>();
  const urlOrigin = parseOrigin(request.url);

  if (urlOrigin) origins.add(urlOrigin);

  const host =
    firstHeaderValue(request.headers.get("x-forwarded-host")) ??
    firstHeaderValue(request.headers.get("host"));
  const protocol =
    firstHeaderValue(request.headers.get("x-forwarded-proto")) ??
    new URL(request.url).protocol.replace(/:$/, "");

  if (host && (protocol === "http" || protocol === "https")) {
    origins.add(`${protocol}://${host}`);
  }

  return origins;
}

export function rejectInvalidCsrfOrigin(request: Request) {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return forbiddenResponse();
  }

  const source = request.headers.get("origin") ?? request.headers.get("referer");
  const sourceOrigin = source ? parseOrigin(source) : null;

  if (!sourceOrigin || !requestOrigins(request).has(sourceOrigin)) {
    return forbiddenResponse();
  }

  return null;
}
