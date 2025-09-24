'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirect to login page
            router.push('/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-lg text-gray-100">Loading...</div>
            </div>
        );
    }

    // If not authenticated, don't render children (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}