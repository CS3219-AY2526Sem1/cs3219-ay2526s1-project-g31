'use client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { user, isAuthenticated, checkAuth } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            // Check auth status to update context
            await checkAuth();

            // Redirect to login
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Title Section */}
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900">PeerPrep</span>
                        </Link>
                    </div>

                    {/* User Section */}
                    {isAuthenticated && user ? (
                        <div className="flex items-center space-x-4">
                            {/* User Avatar and Info */}
                            <Link
                                href="/profile"
                                className="flex items-centercursor-pointer"
                                title="Go to Profile"
                            >
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                                    <span className="text-sm font-medium text-gray-600">
                                        {user.displayName?.charAt(0).toUpperCase() || ""}
                                    </span>
                                </div>
                            </Link>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="bg-gray-200 text-gray-700 p-2 rounded-md transition-colors cursor-pointer hover:bg-gray-300"
                                title="Logout"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    ) : !isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/auth/login"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    ) : null}

                    {/* Mobile menu button */}
                    {isAuthenticated && (
                        <div className="md:hidden">
                            <button className="text-gray-600 hover:text-gray-900">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}