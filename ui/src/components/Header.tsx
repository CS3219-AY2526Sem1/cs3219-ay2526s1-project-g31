'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

/**
 * AI Assistance Disclosure
 * Tool: Microsoft Copilot
 * Scope: Generated initial code consisting of title section, user avatar and logout button.
 * Author review: See AI-usage-log for details.
 */

export default function Header() {
    const { accessToken, logout } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const handleLogout = async () => {
        logout();
        router.push('/auth/login');
    };

    return (
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Title Section */}
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-100">PeerPrep</span>
                        </Link>
                    </div>

                    {/* User Section */}
                    {accessToken && user ? (
                        <div className="flex items-center space-x-3">
                            {/* User Avatar and Info */}
                            <Link
                                href="/profile"
                                className="flex items-centercursor-pointer"
                                title="Go to Profile"
                            >
                                {user.picture ? (
                                    <Image
                                        src={user.picture}
                                        alt={user.displayName || ""}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full object-cover border border-gray-500 hover:border-gray-400"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500">
                                        <span className="text-sm font-medium text-gray-200">
                                            {user.displayName?.charAt(0).toUpperCase() || ""}
                                        </span>
                                    </div>
                                )}
                            </Link>

                            {/* Admin Link */}
                            {user.role === 'ADMIN' && (
                            <div className="flex items-center space-x-2">
                                {/* New Questions Icon */}
                                <Link
                                href="/admin/questions"
                                className="bg-gray-600 text-gray-200 p-2 rounded-md transition-colors cursor-pointer hover:bg-gray-500"
                                title="Manage Questions"
                                >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5"
                                >
                                    <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12s4.03-9 9-9 9 4.03 9 9z"
                                    />
                                </svg>
                                </Link>

                                {/* Existing Gear Icon (Manage Users) */}
                                <Link
                                href="/admin/users"
                                className="bg-gray-600 text-gray-200 p-2 rounded-md transition-colors cursor-pointer hover:bg-gray-500"
                                title="Manage Users"
                                >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                </Link>
                            </div>
                            )}

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="bg-gray-600 text-gray-200 p-2 rounded-md transition-colors cursor-pointer hover:bg-gray-500"
                                title="Logout"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}