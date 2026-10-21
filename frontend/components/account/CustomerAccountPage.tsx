import {
  ArrowRight,
  Mail,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import type { User } from "@/app/(auth)/auth";
import CustomerOrderHistory from "@/components/account/CustomerOrderHistory";
import { roleLabel } from "@/lib/auth/roles";

const QUICK_LINKS = [
  {
    title: "Your orders",
    description: "Track purchases and review order details.",
    href: "/account/orders",
    icon: Package,
  },
  {
    title: "Shopping bag",
    description: "Review the products currently in your bag.",
    href: "/cart",
    icon: ShoppingBag,
  },
  {
    title: "Account settings",
    description: "Manage your photo and account access.",
    href: "/account/settings",
    icon: Settings,
  },
];

export default function CustomerAccountPage({ user }: { user: User }) {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
              Overview
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-primary">
              Your account at a glance
            </h2>
            <p className="mt-2 text-on-surface-variant">
              Jump back into shopping, review purchases, or update your account.
            </p>
          </div>
          <span className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-surface-high text-primary sm:flex">
            <UserRound className="size-5" />
          </span>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-primary/10 bg-surface-low p-5 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-surface-lowest text-primary shadow-sm">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold text-primary">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-secondary">
                  Open
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-primary">
              Account details
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Information currently connected to your account.
            </p>
          </div>
          <Link
            href="/account/settings"
            className="text-sm font-semibold text-primary hover:opacity-70"
          >
            Settings
          </Link>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-low p-4">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              <UserRound className="size-3.5" />
              Display name
            </dt>
            <dd className="mt-2 font-medium text-primary">{user.displayName}</dd>
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
          <div className="rounded-lg bg-surface-low p-4 sm:col-span-2">
            <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
              <ShieldCheck className="size-3.5" />
              Account role
            </dt>
            <dd className="mt-2 font-medium text-primary">
              {roleLabel(user.role)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-primary">
              Recent orders
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Your three most recent purchases.
            </p>
          </div>
          <Link
            href="/account/orders"
            className="shrink-0 text-sm font-semibold text-primary hover:opacity-70"
          >
            View all
          </Link>
        </div>
        <CustomerOrderHistory pageSize={3} compact />
      </section>
    </div>
  );
}
