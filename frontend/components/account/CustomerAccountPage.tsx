"use client";

import {
  LogOut,
  Mail,
  Package,
  ShieldCheck,
  ShoppingBag,
  UserX,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import CustomerAvatarManager from "@/components/account/CustomerAvatarManager";
import CustomerDeactivateAccount from "@/components/account/CustomerDeactivateAccount";
import CustomerOrderHistory from "@/components/account/CustomerOrderHistory";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerAccountPage() {
  const { user, loading, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

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

  if (loading || !user) {
    return (
      <main className="mx-auto min-h-[65vh] max-w-350 px-5 py-14 md:px-8 lg:px-12">
        <div className="h-12 w-64 animate-pulse rounded bg-surface-high" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[340px_1fr]">
          <div className="h-96 animate-pulse rounded-xl bg-surface-low" />
          <div className="h-96 animate-pulse rounded-xl bg-surface-low" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-350 px-5 py-12 md:px-8 lg:px-12 lg:py-16">
      <div className="border-b border-primary/10 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
          Customer account
        </p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-primary md:text-5xl">
          Welcome back, {user.displayName}
        </h1>
        <p className="mt-3 max-w-2xl text-on-surface-variant">
          Manage your profile photo, review your account details, and follow every order in one place.
        </p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-28">
          <section className="rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm">
            <CustomerAvatarManager />
            <div className="mt-6 border-t border-primary/10 pt-5">
              <h2 className="font-serif text-2xl font-semibold text-primary">
                {user.displayName}
              </h2>
              <p className="mt-1 break-all text-sm text-on-surface-variant">
                {user.email}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface-high px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="size-3.5" />
                {user.role === "ADMIN" ? "Administrator" : "Customer"}
              </span>
            </div>
          </section>

          <nav
            aria-label="Account shortcuts"
            className="rounded-xl border border-primary/10 bg-surface-lowest p-3 shadow-sm"
          >
            <a
              href="#profile"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-primary hover:bg-surface-low"
            >
              <UserRound className="size-4" />
              Profile details
            </a>
            <a
              href="#orders"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-primary hover:bg-surface-low"
            >
              <Package className="size-4" />
              Order history
            </a>
            <Link
              href="/cart"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-primary hover:bg-surface-low"
            >
              <ShoppingBag className="size-4" />
              Shopping bag
            </Link>
            {user.role === "USER" && (
              <a
                href="#account-access"
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
              >
                <UserX className="size-4" />
                Account access
              </a>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="size-4" />
              {loggingOut ? "Logging out..." : "Log out"}
            </button>
          </nav>
        </aside>

        <div className="space-y-8">
          <section
            id="profile"
            className="scroll-mt-28 rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-surface-high text-primary">
                <UserRound className="size-5" />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-primary">
                  Profile details
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Information connected to your account.
                </p>
              </div>
            </div>

            <dl className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-surface-low p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                  <UserRound className="size-3.5" />
                  Display name
                </dt>
                <dd className="mt-2 font-medium text-primary">
                  {user.displayName}
                </dd>
              </div>
              <div className="rounded-lg bg-surface-low p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                  <Mail className="size-3.5" />
                  Email address
                </dt>
                <dd className="mt-2 break-all font-medium text-primary">
                  {user.email}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              Display name, email, and password editing will become available when those secure backend endpoints are added.
            </p>
          </section>

          <section
            id="orders"
            className="scroll-mt-28 rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8"
          >
            <div className="mb-7">
              <h2 className="font-serif text-2xl font-semibold text-primary">
                Order history
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Review your purchases and track their current status.
              </p>
            </div>
            <CustomerOrderHistory />
          </section>

          {user.role === "USER" && <CustomerDeactivateAccount />}
        </div>
      </div>
    </main>
  );
}
