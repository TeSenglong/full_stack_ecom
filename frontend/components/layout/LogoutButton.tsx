"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";


export function LogoutButton() {
    const router = useRouter();
    const { logout } = useAuth();

    async function handleLogout() {
        await logout();
        router.replace("/login");
        router.refresh();
    }

    return (
        <button type="button" onClick={handleLogout}>
            Logout
        </button>
    );
}