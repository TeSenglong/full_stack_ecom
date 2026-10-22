"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/app/provider/languageProvider";

interface MobileNavItem {
  label: string;
  href: string;
  icon: string;
  active: (pathname: string) => boolean;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isHidden } = useScrollVisibility();
  const { language, messages } = useLanguage();

  if (pathname.startsWith("/checkout")) {
    return null;
  }

  const items: MobileNavItem[] = [
    {
      label: messages.nav.home,
      href: "/",
      icon: "home",
      active: (currentPath) => currentPath === "/",
    },
    {
      label: messages.nav.shop,
      href: "/products",
      icon: "storefront",
      active: (currentPath) =>
        currentPath.startsWith("/products") ||
        currentPath.startsWith("/categories"),
    },
    {
      label: messages.nav.search,
      href: "/search",
      icon: "search",
      active: (currentPath) => currentPath.startsWith("/search"),
    },
    {
      label: messages.nav.account,
      href: "/account",
      icon: "person",
      active: (currentPath) => currentPath.startsWith("/account"),
    },
  ];

  return (
    <>
      <div
        aria-hidden="true"
        className="h-[calc(4rem+env(safe-area-inset-bottom))] lg:hidden"
      />
      <nav
        aria-label={messages.nav.mobileNavigation}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 border-t border-outline/20 bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(20,30,25,0.08)] backdrop-blur-xl transition-transform duration-500 ease-in-out lg:hidden",
          isHidden ? "translate-y-full" : "translate-y-0",
        )}
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-4 px-2">
          {items.map((item) => {
            const isActive = item.active(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                  isActive
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-primary",
                )}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-secondary"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="material-symbols-outlined text-[23px]"
                  style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
                >
                  {item.icon}
                </span>
                <span
                  lang={language === "kh" ? "km" : "en"}
                  className={cn("truncate", language === "kh" && "khmer-text text-xs")}
                >{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
