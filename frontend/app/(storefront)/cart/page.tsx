import type { Metadata } from "next";
import { redirect } from "next/navigation";

import CustomerCartPage from "@/components/cart/CustomerCartPage";
import { getServerCurrentUser } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Your Shopping Bag | Atelier & Co.",
  description: "Review the pieces in your Atelier & Co. shopping bag.",
};

export default async function CartPage() {
  const user = await getServerCurrentUser();

  if (!user) {
    redirect("/login?next=%2Fcart");
  }

  return <CustomerCartPage />;
}
