import type { User } from "@/app/(auth)/auth";

async function responseError(response: Response) {
  const data = await response.json().catch(() => null);
  return data?.message ?? data?.error ?? "Unable to update your profile";
}

export async function uploadAccountAvatar(file: File): Promise<User> {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch("/api/account/avatar", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  return response.json() as Promise<User>;
}

export async function deleteAccountAvatar(): Promise<User> {
  const response = await fetch("/api/account/avatar", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await responseError(response));
  }

  return response.json() as Promise<User>;
}

export async function deactivateAccount(password: string): Promise<void> {
  const response = await fetch("/api/account/deactivate", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error(await responseError(response));
  }
}
