import MainFooter from "@/components/layout/MainFooter";
import MainHeader from "@/components/layout/MainHeader";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { CustomerCartProvider } from "@/components/cart/CustomerCartProvider";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/app/provider/languageProvider";
import { getLanguage, LANGUAGE_COOKIE } from "@/lib/i18n";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = getLanguage((await cookies()).get(LANGUAGE_COOKIE)?.value);

  return (
    <LanguageProvider initialLanguage={language}>
      <CustomerCartProvider>
        <div className="storefront flex min-h-screen flex-col bg-surface text-on-surface">
          <MainHeader />
          <div className="flex-1">{children}</div>
          <MainFooter />
          <MobileBottomNav />
          <Toaster position="bottom-right" richColors />
        </div>
      </CustomerCartProvider>
    </LanguageProvider>
  );
}
