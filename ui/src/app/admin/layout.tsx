"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/dist/client/components/navigation";
import { useEffect, useMemo } from "react";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { accessToken, isLoading: authLoading } = useAuth();
    const { user: me } = useUser();
    const router = useRouter();
    const isAdmin = useMemo(() => me?.role === 'ADMIN', [me]);

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && (!accessToken || !isAdmin)) {
            router.push('/');
        }

    }, [router, authLoading, accessToken, isAdmin]);

    return (
        <>
            {children}
        </>
    );
}
