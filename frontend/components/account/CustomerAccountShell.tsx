"use client";

import {
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import type { User } from "@/app/(auth)/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ACCOUNT_LINKS = [
  {
    label: "Overview",
    href: "/account",
    icon: LayoutDashboard,
    active: (pathname: string) => pathname === "/account",
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: Package,
    active: (pathname: string) => pathname.startsWith("/account/orders"),
  },
  {
    label: "Settings",
    href: "/account/settings",
    icon: Settings,
    active: (pathname: string) => pathname.startsWith("/account/settings"),
  },
];

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

export default function CustomerAccountShell({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { user: clientUser, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const currentUser = clientUser ?? user;

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
      window.location.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to log out");
      setLoggingOut(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-350 px-5 py-10 md:px-8 lg:px-12 lg:py-14">
      <header className="border-b border-primary/10 pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Customer account
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">
          Welcome back, {currentUser.displayName}
        </h1>
        <p className="mt-3 max-w-2xl text-on-surface-variant">
          Review your account, follow your orders, and manage your preferences.
        </p>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-28">
          <section className="flex items-center gap-4 rounded-xl border border-primary/10 bg-surface-lowest p-4 shadow-sm lg:block lg:p-5">
            <Avatar className="size-14 shrink-0 bg-surface-high lg:size-20">
              {currentUser.avatarUrl && (
                <AvatarImage
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                />
              )}
              <AvatarFallback className="font-serif text-xl font-semibold text-primary lg:text-2xl">
                {initials(currentUser.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 lg:mt-4">
              <h2 className="truncate font-serif text-xl font-semibold text-primary">
                {currentUser.displayName}
              </h2>
              <p className="mt-0.5 truncate text-sm text-on-surface-variant">
                {currentUser.email}
              </p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface-high px-2.5 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="size-3.5" />
                {currentUser.role === "ADMIN" ? "Administrator" : "Customer"}
              </span>
            </div>
          </section>

          <nav
            aria-label="Account navigation"
            className="grid grid-cols-3 rounded-xl border border-primary/10 bg-surface-lowest p-2 shadow-sm lg:grid-cols-1"
          >
            {ACCOUNT_LINKS.map((item) => {
              const active = item.active(pathname);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-w-0 flex-col items-center gap-1.5 rounded-lg px-2 py-3 text-xs font-medium transition-colors lg:flex-row lg:gap-3 lg:px-3 lg:text-sm",
                    active
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-low hover:text-primary",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-950 dark:text-red-300 dark:hover:bg-red-950"
          >
            <LogOut className="size-4" />
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
