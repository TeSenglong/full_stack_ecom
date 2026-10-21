import type { Metadata } from "next";
import { Mail, ShieldCheck, UserRound } from "lucide-react";

import CustomerAvatarManager from "@/components/account/CustomerAvatarManager";
import CustomerDeactivateAccount from "@/components/account/CustomerDeactivateAccount";
import { getServerCurrentUser } from "@/lib/auth/server";
import { roleLabel } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Account Settings | MOHAORI",
  description: "Manage your MOHAORI profile and account access.",
};

export default async function AccountSettingsPage() {
  const user = await getServerCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-primary/10 bg-surface-lowest p-6 shadow-sm md:p-8">
        <div className="border-b border-primary/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary">
            Preferences
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-primary">
            Account settings
          </h2>
          <p className="mt-2 text-on-surface-variant">
            Manage your profile photo and review the details connected to your account.
          </p>
        </div>

        <div className="mt-7 grid items-start gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
          <CustomerAvatarManager />

          <div>
            <h3 className="font-serif text-2xl font-semibold text-primary">
              Profile details
            </h3>
            <dl className="mt-5 space-y-4">
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
              <div className="rounded-lg bg-surface-low p-4">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                  <ShieldCheck className="size-3.5" />
                  Account role
                </dt>
                <dd className="mt-2 font-medium text-primary">
                  {roleLabel(user.role)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-on-surface-variant">
              Display name, email, and password editing will become available when those secure backend endpoints are added.
            </p>
          </div>
        </div>
      </section>

      {user.role === "USER" && <CustomerDeactivateAccount />}
    </div>
  );
}
