import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CustomerOrderDetails from "@/components/account/CustomerOrderDetails";

export const metadata: Metadata = {
  title: "Order Details | MOHAORI",
};

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    notFound();
  }

  return <CustomerOrderDetails orderId={Number(id)} />;
}
