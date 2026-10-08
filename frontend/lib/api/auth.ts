import type { LoginRequest, RegisterRequest, User } from "@/app/(auth)/auth";

async function getErrorMessage(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);

  return data?.message ?? data?.error ?? "Something went wrong";
}

export async function loginUser(
  credentials: LoginRequest,
): Promise<User> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const data = await response.json();

  return data.user;
}

export async function registerUser(
  information: RegisterRequest,
): Promise<User> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(information),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch("/api/auth/me", {
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load the current user");
  }

  return response.json();
}

export async function logoutUser(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to log out");
  }
}