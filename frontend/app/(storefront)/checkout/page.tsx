import type { Metadata } from "next";

import CustomerCheckoutPage from "@/components/cart/CustomerCheckoutPage";

export const metadata: Metadata = {
  title: "Checkout | MOHAORI",
  description: "Complete your MOHAORI order.",
};

export default function CheckoutPage() {
  return <CustomerCheckoutPage />;
}
