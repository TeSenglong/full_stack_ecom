"use client";

import { Camera, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteAccountAvatar,
  uploadAccountAvatar,
} from "@/lib/api/account";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export default function CustomerAvatarManager() {
  const { user, updateCurrentUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const busy = uploading || removing;

  if (!user) {
    return null;
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("Profile image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);

    try {
      const updatedUser = await uploadAccountAvatar(file);
      updateCurrentUser(updatedUser);
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload profile photo",
      );
    } finally {
      setUploading(false);
    }
  }

  async function removeAvatar() {
    if (!user?.avatarUrl || !window.confirm("Remove your profile photo?")) {
      return;
    }

    setRemoving(true);

    try {
      const updatedUser = await deleteAccountAvatar();
      updateCurrentUser(updatedUser);
      toast.success("Profile photo removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove profile photo",
      );
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
      <div className="relative">
        <Avatar className="size-28 bg-surface-high">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
          )}
          <AvatarFallback className="font-serif text-3xl font-semibold text-primary">
            {initials(user.displayName)}
          </AvatarFallback>
        </Avatar>
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/65 text-on-primary">
            <LoaderCircle className="size-6 animate-spin" />
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="sr-only"
        disabled={busy}
      />

      <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Camera className="size-4" />
          {user.avatarUrl ? "Replace photo" : "Add photo"}
        </button>
        {user.avatarUrl && (
          <button
            type="button"
            onClick={removeAvatar}
            disabled={busy}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-high disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            Remove
          </button>
        )}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
        JPEG, PNG, or WebP. Maximum 5 MB.
      </p>
    </div>
  );
}
