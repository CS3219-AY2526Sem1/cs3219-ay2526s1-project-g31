'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/router";

import Spinner from "../../components/Spinner";

export default function AuthGuard({ children }: { children: React.ReactNode}) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <Spinner fullScreen={true} message="Loading..." />;
    }

    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}