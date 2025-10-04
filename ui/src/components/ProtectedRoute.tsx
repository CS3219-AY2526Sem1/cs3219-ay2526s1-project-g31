'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Spinner from './Spinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { accessToken, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!accessToken && !isLoading) {
            // Redirect to login page
            router.push('/auth/login');
        }
    }, [accessToken, isLoading, router]);

    if (isLoading) {
        return (<div className="flex items-center justify-center h-screen">
            <Spinner />
        </div>
        );
    }

    // If not authenticated, don't render children (will redirect)
    if (!accessToken) {
        return null;
    }

    return <>{children}</>;
}