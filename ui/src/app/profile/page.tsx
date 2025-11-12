'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';

/**
 * AI Assistance Disclosure
 * Tool: Microsoft Copilot
 * Scope: See AI-usage-log for details.
 * Author review: See AI-usage-log for details.
 */

export default function Profile() {
    const router = useRouter();
    const { isLoading, accessToken, logout, authFetch } = useAuth();
    const { user } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [editedDisplayName, setEditedDisplayName] = useState('');
    const [isEditingPicture, setIsEditingPicture] = useState(false);
    const [editedPicture, setEditedPicture] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.displayName) {
            setEditedDisplayName(user.displayName);
        }
        if (user?.picture) {
            setEditedPicture(user.picture);
        }
    }, [user]);

    useEffect(() => {
        if (!isLoading && !accessToken) {
            router.push('/auth/login');
        }
    }, [accessToken, isLoading, router]);

    const handleEditName = async () => {
        if (!editedDisplayName.trim()) {
            setError('Display name cannot be empty');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const response = await authFetch(
                `${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/user/me`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        displayName: editedDisplayName.trim(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Refresh page to get updated user data
            setIsEditing(false);
            window.location.reload();
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
            const response = await authFetch(
                `${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/user/me`,
                {
                    method: 'DELETE',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete profile');
            }

            logout();
        } catch (err) {
            setError('Failed to delete profile. Please try again.');
            console.error('Delete profile error:', err);
            setIsDeleting(false);
        }
    };

    const handleEditPicture = async () => {
        if (!editedPicture.trim()) {
            setError('Profile picture URL cannot be empty');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const response = await authFetch(
                `${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/user/me`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        picture: editedPicture.trim(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update profile picture');
            }

            // Refresh page to get updated user data
            setIsEditingPicture(false);
            window.location.reload();
        } catch (err) {
            setError('Failed to update profile picture. Please try again.');
            console.error('Update profile picture error:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditedDisplayName(user?.displayName || '');
        setIsEditing(false);
        setError('');
    };

    const cancelEditPicture = () => {
        setEditedPicture(user?.picture || '');
        setIsEditingPicture(false);
        setError('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
        );
    }

    if (!accessToken || !user) {
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

                                {/* Profile Picture URL */}
                                <div className="border border-gray-600 rounded-lg p-4 mt-4 bg-gray-700">
                                    <label className="block text-sm font-medium text-gray-200 mb-2">
                                        Profile Picture URL
                                    </label>

                                    {isEditingPicture ? (
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="text"
                                                value={editedPicture}
                                                onChange={(e) => setEditedPicture(e.target.value)}
                                                className="text-black bg-gray-100 flex-1 border border-gray-500 rounded-md px-3 py-2 focus:ring-blue-400 focus:border-blue-400"
                                                placeholder="Enter profile picture URL"
                                                disabled={isSaving}
                                            />
                                            <button
                                                onClick={handleEditPicture}
                                                disabled={isSaving || !editedPicture.trim()}
                                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                {isSaving ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={cancelEditPicture}
                                                disabled={isSaving}
                                                className="border border-gray-500 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-200 truncate mr-4">
                                                {user.picture || "No picture set"}
                                            </span>
                                            <button
                                                onClick={() => setIsEditingPicture(true)}
                                                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    )}
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
