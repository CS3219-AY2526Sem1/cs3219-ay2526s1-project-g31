'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';

export default function Profile() {
    const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedDisplayName, setEditedDisplayName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.displayName) {
            setEditedDisplayName(user.displayName);
        }
    }, [user]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const handleEditName = async () => {
        if (!user?.google_id || !editedDisplayName.trim()) {
            setError('Display name cannot be empty');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/user/${user.google_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    displayName: editedDisplayName.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Refresh user data
            await checkAuth();
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error('Update profile error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProfile = async () => {
        if (!user?.google_id) return;

        setIsDeleting(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/user/${user.google_id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete profile');
            }

            // Logout and redirect to login
            await fetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            // Force auth context refresh to clear user state
            await checkAuth();

            // Redirect to login
            router.push('/auth/login');
        } catch (err) {
            setError('Failed to delete profile. Please try again.');
            console.error('Delete profile error:', err);
            setIsDeleting(false);
        }
    };

    const cancelEdit = () => {
        setEditedDisplayName(user?.displayName || '');
        setIsEditing(false);
        setError('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <>
            <Header />
            <div className="h-[calc(100vh-4rem)] bg-gray-900 py-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden flex-col item-center w-full border border-gray-700">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-8">
                            <div className="flex items-center">
                                {/* Profile Picture */}
                                <div className="flex-shrink-0">
                                    {user.picture ? (
                                        <Image
                                            src={user.picture}
                                            alt={user.displayName || "Profile Picture"}
                                            width={80}
                                            height={80}
                                            className="w-20 h-20 rounded-full border-4 border-white object-cover"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-600 rounded-full border-4 border-gray-400 flex items-center justify-center">
                                            <span className="text-2xl font-bold text-gray-200">
                                                {user.displayName?.charAt(0).toUpperCase() || ""}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* User Info */}
                                <div className="ml-6">
                                    <h1 className="text-3xl font-bold text-gray-100">
                                        {user.displayName || "No Name Set"}
                                    </h1>
                                    <p className="text-gray-300 mt-1">
                                        {user.email || "No Email"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6">
                            {error && (
                                <div className="mb-6 bg-red-900 border border-red-700 rounded-md p-4">
                                    <p className="text-sm text-red-200">{error}</p>
                                </div>
                            )}

                            {/* Edit Display Name Section */}
                            <div className="mb-8">
                                <h2 className="text-lg font-semibold text-gray-100 mb-4">Profile Information</h2>

                                <div className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Name
                                    </label>

                                    {isEditing ? (
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="text"
                                                value={editedDisplayName}
                                                onChange={(e) => setEditedDisplayName(e.target.value)}
                                                className="text-black bg-gray-100 flex-1 border border-gray-500 rounded-md px-3 py-2 focus:ring-blue-400 focus:border-blue-400"
                                                placeholder="Enter your display name"
                                                disabled={isSaving}
                                            />
                                            <button
                                                onClick={handleEditName}
                                                disabled={isSaving || !editedDisplayName.trim()}
                                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                disabled={isSaving}
                                                className="border border-gray-500 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-200">
                                                {user.displayName || "No name set"}
                                            </span>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Email (Read-only) */}
                                <div className="border border-gray-600 rounded-lg p-4 mt-4 bg-gray-700">
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Email Address
                                    </label>
                                    <span className="text-gray-200">{user.email || "No email"}</span>
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="border border-red-600 rounded-lg p-4 bg-red-900/20">
                                <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                                <p className="text-sm text-red-300 mb-4">
                                    Once you delete your profile, there is no going back. Please be certain.
                                </p>

                                {showDeleteConfirm ? (
                                    <div className="flex items-center space-x-3">
                                        <p className="text-sm text-red-300">Are you sure? This action cannot be undone.</p>
                                        <button
                                            onClick={handleDeleteProfile}
                                            disabled={isDeleting}
                                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            disabled={isDeleting}
                                            className="border border-gray-500 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Delete Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
