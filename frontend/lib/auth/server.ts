import "server-only";

import type { User } from "@/app/(auth)/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

const BACKEND_URL = process.env.BACKEND_URL;

export const getServerCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    return null;
  }

  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is not configured");
  }

  const response = await fetch(`${BACKEND_URL}/account`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to verify the current user (${response.status})`);
  }

  return response.json() as Promise<User>;
});

export async function requireAdmin(): Promise<User> {
  const user = await getServerCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
