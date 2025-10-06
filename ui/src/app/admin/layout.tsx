"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useEffect, useMemo } from "react";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { isLoading: authLoading, accessToken } = useAuth();
    const { user: me } = useUser();
    const isAdmin = useMemo(() => me?.role === 'ADMIN', [me]);

    useEffect(() => {
        // Redirect if not admin
        if (!authLoading && (!accessToken || !isAdmin)) {
            window.location.href = '/'; // trigger full reload to clear state
        }

    }, [authLoading, accessToken, isAdmin]);

    return (
        <>
            {children}
        </>
    );
}
