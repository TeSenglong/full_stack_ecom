import "server-only";

export function getBackendUrl(): string {
  const backendUrl = process.env.BACKEND_URL?.trim().replace(/\/+$/, "");

  if (!backendUrl) {
    throw new Error("BACKEND_URL is not configured");
  }

  return backendUrl;
}
