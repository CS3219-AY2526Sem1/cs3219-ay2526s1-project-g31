'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Spinner from '@/components/Spinner';

/**
 * AI Assistance Disclosure
 * Tool: Microsoft Copilot  
 * Scope: Generated initial HTML code.
 * Author review: Validated correctness and modified HTML code and styling.
 */

export default function Login() {
    const { accessToken, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && accessToken) {
            // If already logged in, redirect to homepage
            router.push('/');
        }
    }, [accessToken, isLoading, router]);

    const handleGoogleLogin = () => {
        // Redirect to your backend Google auth
        window.location.href = `${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/auth/google`;
    };

    if (isLoading) {
        return <Spinner fullScreen={true} message="Loading..." />;
    }

    if (accessToken) {
        return null; // Will redirect
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-700">
                    {/* Logo/Header Section */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-100 mb-2">Sign in to PeerPrep</h1>
                        <p className="text-gray-300">Get started with your Google account</p>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-gray-700 text-gray-100 font-semibold py-3 px-4 border border-gray-600 rounded-lg shadow-sm hover:bg-gray-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
                    >
                        <div className="flex items-center justify-center space-x-3">
                            {/* Google Icon */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Continue with Google</span>
                        </div>
                    </button>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            By signing in, you agree to our{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-500 underline">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</a>
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Secure authentication powered by Google
                    </p>
                </div>
            </div>
        </div>
    );
}