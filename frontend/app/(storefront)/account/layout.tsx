import { redirect } from "next/navigation";

import CustomerAccountShell from "@/components/account/CustomerAccountShell";
import { getServerCurrentUser } from "@/lib/auth/server";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerCurrentUser();

  if (!user) {
    redirect("/login?next=%2Faccount");
  }

  return <CustomerAccountShell user={user}>{children}</CustomerAccountShell>;
}
