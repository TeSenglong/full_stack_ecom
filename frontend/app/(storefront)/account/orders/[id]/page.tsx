import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import CustomerOrderDetails from "@/components/account/CustomerOrderDetails";
import { getServerCurrentUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Order Details | MOHAORI",
};

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getServerCurrentUser();

  if (!user) {
    redirect("/login?next=%2Faccount");
  }

  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  return <CustomerOrderDetails orderId={Number(id)} />;
}
