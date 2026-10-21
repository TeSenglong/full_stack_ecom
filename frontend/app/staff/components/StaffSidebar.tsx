"use client"

import Link from "next/link"
import { BoxesIcon, LayoutDashboardIcon, ShoppingCartIcon } from "lucide-react"

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
    url: "/staff",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "Orders",
    url: "/staff/orders",
    icon: <ShoppingCartIcon />,
  },
  {
    title: "Products",
    url: "/staff/products",
    icon: <BoxesIcon />,
  },
]

export function StaffSidebar({
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
              render={<Link href="/staff" />}
            >
              <span className="font-serif text-base font-semibold">
                MOHAORI STAFF
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
