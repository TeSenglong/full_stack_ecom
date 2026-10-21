"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCustomerCart } from "@/components/cart/CustomerCartProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useScrollVisibility } from "@/hooks/useScrollVisibility";
import { roleHomePath } from "@/lib/auth/roles";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
];

function userInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export default function MainHeader() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading: cartLoading } = useCustomerCart();
  const [searchQuery, setSearchQuery] = useState("");
  const { isHidden, isScrolled } = useScrollVisibility();

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${isHidden ? "-translate-y-full" : "translate-y-0"
        } ${isScrolled
          ? "border-b border-outline/20 bg-surface/90 shadow-md backdrop-blur-xl"
          : "bg-surface"
        }`}
    >
      <div className="mx-auto flex h-20 max-w-1400 items-center justify-between gap-2 px-4 sm:gap-6 sm:px-5 md:px-8 lg:px-12">
        <Link
          href="/"
          className="font-serif text-[21px] font-semibold tracking-tight text-primary sm:text-[24px]"
        >
          MOHAORI
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={link.href.startsWith("/about") ? false : undefined}
              className="text-[13px] font-medium uppercase tracking-[0.08em] text-on-surface-variant transition-opacity hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const query = searchQuery.trim();
              router.push(query ? `/products?q=${encodeURIComponent(query)}` : "/products");
            }}
            className="hidden items-center gap-2 rounded bg-surface-low px-4 py-2 lg:flex"
          >
            <span className="material-symbols-outlined text-[18px] text-outline">search</span>
            <input
              aria-label="Search catalog"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-32 bg-transparent text-[13px] text-on-surface outline-none xl:w-44"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="cursor-pointer text-xs text-outline hover:text-primary"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </form>

          <button
            type="button"
            aria-label="Wishlist"
            className="relative hidden cursor-pointer p-1 transition-opacity hover:opacity-70 lg:block"
          >
            <span className="material-symbols-outlined">favorite</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] text-on-secondary">
              0
            </span>
          </button>
          <Link
            href={user ? "/cart" : "/login?next=%2Fcart"}
            aria-label={user ? "Shopping bag" : "Sign in to view your shopping bag"}
            className="relative cursor-pointer p-1 transition-opacity hover:opacity-70"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-on-primary">
              {cartLoading ? "·" : cart.totalItems > 99 ? "99+" : cart.totalItems}
            </span>
          </Link>
          <Link
            href={!user ? "/login" : roleHomePath(user.role)}
            aria-label={!user ? "Log in" : `Account for ${user.displayName}`}
            className="hidden cursor-pointer items-center p-1 transition-opacity hover:opacity-70 lg:flex"
          >
            {!user ? (
              <span className="material-symbols-outlined">person</span>
            ) : (
              <Avatar className="size-8 bg-surface-high">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                )}
                <AvatarFallback className="text-xs font-semibold text-primary">
                  {userInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
