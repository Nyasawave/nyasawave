'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ExtendedSession } from '@/app/types/auth';

interface UserRole {
    id: string;
    email: string;
    roles: string[];
    createdAt: string;
}

export default function AdminRoles() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
    const router = useRouter();
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
        if (session && !(session.user as any)?.roles?.includes('ADMIN')) {
            router.push('/unauthorized');
        }
    }, [session, status, router]);

    useEffect(() => {
        if (session?.user?.roles?.includes('ADMIN')) {
            fetchRoles();
        }
    }, [session]);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            if (data.ok) {
                setRoles(data.users || []);
            } else {
                setError('Failed to fetch roles');
            }
        } catch (err) {
            setError('Error fetching roles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (userId: string, role: string) => {
        try {
            const response = await fetch('/api/admin/users/role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role }),
            });

            if (response.ok) {
                await fetchRoles();
                setEditingId(null);
            } else {
                setError('Failed to update role');
            }
        } catch (err) {
            setError('Error updating role');
            console.error(err);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <main className="min-h-screen bg-black pt-32 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center">
                        <div className="inline-block">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-zinc-400 mt-4">Loading roles...</p>
                    </div>
                </div>
            </main>
        );
    }

    if (!(session?.user as any)?.roles?.includes('ADMIN')) {
        return null;
    }

    return (
        <main className="min-h-screen bg-black pt-32 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">User Roles Management</h1>
                    <p className="text-zinc-400">Manage user roles and permissions</p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-8">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-zinc-700">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-white">Email</th>
                                <th className="px-4 py-3 font-semibold text-white">Current Roles</th>
                                <th className="px-4 py-3 font-semibold text-white">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {roles.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-900/50 transition">
                                    <td className="px-4 py-3 text-zinc-300">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 flex-wrap">
                                            {user.roles.map((role) => (
                                                <span
                                                    key={role}
                                                    className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-600/50"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() =>
                                                setEditingId(editingId === user.id ? null : user.id)
                                            }
                                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                                        >
                                            {editingId === user.id ? 'Cancel' : 'Edit'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8">
                    <Link
                        href="/admin"
                        className="text-blue-400 hover:text-blue-300 font-medium transition"
                    >
                        ← Back to Admin Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
