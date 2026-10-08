"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  TagsIcon,
  UsersIcon,
} from "lucide-react"

import type { User } from "@/app/(auth)/auth"
import { AdminNavMain } from "@/app/admin/components/AdminNavMain"
import { AdminNavUser } from "@/app/admin/components/AdminNavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: <PackageIcon />,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: <TagsIcon />,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: <ShoppingCartIcon />,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: <UsersIcon />,
  },
]

export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/admin" />}
            >
              <span className="font-serif text-base font-semibold">
                Atelier &amp; Co.
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={navigationItems} />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
