import type { Metadata } from "next";

import CustomerCheckoutPage from "@/components/cart/CustomerCheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | Atelier & Co.",
  description: "Complete your Atelier & Co. order.",
};

export default function CheckoutPage() {
  return <CustomerCheckoutPage />;
}
