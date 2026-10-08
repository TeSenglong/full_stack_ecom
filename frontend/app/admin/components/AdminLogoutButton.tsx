"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminLogoutButton() {
    const router = useRouter();
    const { logout } = useAuth();

    async function handleLogout() {
        await logout();
        router.replace("/login");
        router.refresh();
    }

    return (
        <DropdownMenuItem onClick={handleLogout}>
            <LogOutIcon />
            Log out
        </DropdownMenuItem>
    );
}
