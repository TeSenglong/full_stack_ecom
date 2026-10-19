import type { Metadata } from "next";
import CustomerAccountPage from "@/components/account/CustomerAccountPage";
import { getServerCurrentUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "My Account | MOHAORI",
  description: "Manage your MOHAORI customer account and orders.",
};

export default async function AccountPage() {
  const user = await getServerCurrentUser();

  if (!user) {
    return null;
  }

  return <CustomerAccountPage user={user} />;
}
