import type { Metadata } from "next";
import { redirect } from "next/navigation";

import CustomerAccountPage from "@/components/account/CustomerAccountPage";
import { getServerCurrentUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "My Account | MOHAORI",
  description: "Manage your MOHAORI customer account and orders.",
};

export default async function AccountPage() {
  const user = await getServerCurrentUser();

  if (!user) {
    redirect("/login?next=%2Faccount");
  }

  return <CustomerAccountPage />;
}
