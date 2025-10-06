'use client';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'shared';
import { useState } from 'react';
import Image from 'next/image';

export default function AdminUsersPage() {
    const { authFetch, refreshAccessToken } = useAuth();

    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<User[]>([]);
    const [selected, setSelected] = useState<User | null>(null);
    const [editing, setEditing] = useState<User | null>(null);
    const [busy, setBusy] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults([]);
        setSelected(null);

        const id = query.trim();
        if (!id) return;

        setLoading(true);
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/user/search?q=${encodeURIComponent(id)}`);
            if (res.ok) {
                const data: User[] = await res.json();
                setResults(data);
                if (data.length > 0) {
                    setSelected(data[0]);
                    setEditing(data[0]);
                } else {
                    setSelected(null);
                    setEditing(null);
                    setError('No users found');
                }
            } else {
                const text = await res.text();
                setError(text || 'Failed to fetch user');
            }
        } catch (err) {
            setError('Failed to fetch user');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editing) return;
        setBusy(true);
        setError(null);
        try {
            const { google_id, displayName, firstName, lastName, picture, email, role } = editing as User & { role?: User['role'] };
            const res = await authFetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/user/${encodeURIComponent(google_id)}`, {
                method: 'PUT',
                body: JSON.stringify({ displayName, firstName, lastName, picture, email, role })
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Update failed');
            }
            const updated = await res.json();
            // Update in results list
            setResults(prev => prev.map(u => u.google_id === updated.google_id ? updated : u));
            setSelected(updated);
            setEditing(updated);
        } catch (err) {
            console.error(err);
            setError('Failed to update user');
        } finally {
            setBusy(false);
            refreshAccessToken();
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setBusy(true);
        setError(null);
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_USER_SERVICE_BASE_URL}/api/user/${encodeURIComponent(selected.google_id)}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Delete failed');
            }
            setResults(prev => prev.filter(u => u.google_id !== selected.google_id));
            setSelected(null);
            setEditing(null);
            setQuery('');
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error(err);
            setError('Failed to delete user');
        } finally {
            setBusy(false);
            refreshAccessToken();
        }
    };

    return (
        <>
            <Header />
            <div className="h-[calc(100vh-4rem)] bg-gray-900 py-6 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-full flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-100 mb-6 flex-shrink-0">Manage Users</h1>

                    <form onSubmit={handleSearch} className="flex gap-3 mb-6 flex-shrink-0">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter name, email or google_id"
                            className="flex-1 bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500 focus:ring-blue-400 focus:border-blue-400 text-sm"
                            disabled={loading || busy}
                        />
                        <button
                            type="submit"
                            disabled={loading || busy || !query.trim()}
                            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            {loading ? 'Searching…' : 'Search'}
                        </button>
                    </form>

                    {error && (
                        <div className="mb-6 bg-red-900 border border-red-700 rounded-md p-4 flex-shrink-0">
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    )}
                    {results.length > 0 && (
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1 min-h-0 overflow-hidden">
                            <div className="xl:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col overflow-hidden">
                                <h3 className="text-md font-semibold text-gray-100 mb-4 flex-shrink-0">Results ({results.length})</h3>
                                <ul className="divide-y divide-gray-700 overflow-y-auto flex-1">
                                    {results.map(u => (
                                        <li key={u.id} className={`py-4 cursor-pointer ${selected?.id === u.id ? 'bg-gray-700' : 'hover:bg-gray-700/60'} rounded-md px-3`}
                                            onClick={() => { setSelected(u); setEditing(u); }}>
                                            <div className="flex items-center gap-4">
                                                {u.picture ? (
                                                    <Image
                                                        src={u.picture}
                                                        alt={u.displayName || ""}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-600"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center border border-gray-600">
                                                        <span className="text-sm font-medium text-gray-200">{(u.displayName || u.firstName || '?').charAt(0).toUpperCase()}</span>
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="text-gray-100 font-medium flex items-center gap-2 mb-1">
                                                        <span>{u.displayName || '(no name)'}</span>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${u.role === 'ADMIN' ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200' : 'bg-gray-700/50 border-gray-500 text-gray-300'}`}>
                                                            {u.role || 'USER'}
                                                        </span>
                                                    </div>
                                                    {u.email ? <div className="text-xs text-gray-400 break-all">{u.email}</div> : null}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {selected && editing && (
                                <div className="xl:col-span-3 h-full">
                                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 flex flex-col h-full">
                                        <h2 className="text-lg font-semibold text-gray-100 mb-4 flex-shrink-0">User Profile</h2>

                                        <div className="overflow-y-auto flex-1 space-y-3">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-200 mb-1">Display Name</label>
                                                    <input
                                                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                                                        value={editing.displayName || ''}
                                                        onChange={(e) => setEditing({ ...editing, displayName: e.target.value })}
                                                        disabled={busy}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-200 mb-1">First Name</label>
                                                    <input
                                                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                                                        value={editing.firstName || ''}
                                                        onChange={(e) => setEditing({ ...editing, firstName: e.target.value })}
                                                        disabled={busy}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-200 mb-1">Last Name</label>
                                                    <input
                                                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                                                        value={editing.lastName || ''}
                                                        onChange={(e) => setEditing({ ...editing, lastName: e.target.value })}
                                                        disabled={busy}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-200 mb-1">Email</label>
                                                    <input
                                                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                                                        value={editing.email || ''}
                                                        onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                                                        disabled={busy}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-200 mb-1">Role</label>
                                                    <select
                                                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                                                        value={editing.role || 'USER'}
                                                        onChange={(e) => setEditing({ ...editing, role: e.target.value as User['role'] })}
                                                        disabled={busy}
                                                    >
                                                        <option value="USER">USER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-200 mb-1">Picture URL</label>
                                                    <input
                                                        className="w-full bg-gray-100 text-black rounded-md px-3 py-2 border border-gray-500"
                                                        value={editing.picture || ''}
                                                        onChange={(e) => setEditing({ ...editing, picture: e.target.value })}
                                                        disabled={busy}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <button
                                                        onClick={handleUpdate}
                                                        disabled={busy}
                                                        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                    >
                                                        {busy ? 'Saving…' : 'Save Changes'}
                                                    </button>
                                                    {!showDeleteConfirm && (
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(true)}
                                                            disabled={busy}
                                                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                        >
                                                            Delete User
                                                        </button>
                                                    )}
                                                </div>
                                                {showDeleteConfirm && (
                                                    <div className="bg-red-900/20 border border-red-600 rounded-lg p-3">
                                                        <p className="text-red-300 mb-3 text-sm">Are you sure you want to delete this user? This action cannot be undone.</p>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={handleDelete}
                                                                disabled={busy}
                                                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                            >
                                                                {busy ? 'Deleting…' : 'Yes, Delete'}
                                                            </button>
                                                            <button
                                                                onClick={() => setShowDeleteConfirm(false)}
                                                                disabled={busy}
                                                                className="border border-gray-500 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
