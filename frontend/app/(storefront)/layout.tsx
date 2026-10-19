import MainFooter from "@/components/layout/MainFooter";
import MainHeader from "@/components/layout/MainHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { CustomerCartProvider } from "@/components/cart/CustomerCartProvider";
import { Toaster } from "@/components/ui/sonner";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CustomerCartProvider>
      <div className="storefront flex min-h-screen flex-col bg-surface text-on-surface">
        <MainHeader />
        <div className="flex-1">{children}</div>
        <MainFooter />
        <MobileBottomNav />
        <Toaster position="bottom-right" richColors />
      </div>
    </CustomerCartProvider>
  );
}
