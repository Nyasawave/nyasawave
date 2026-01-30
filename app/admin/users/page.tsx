'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import type { ExtendedSession } from '@/app/types/auth';

interface ConfirmDialog {
    open: boolean;
    action: 'ban' | 'unban' | 'role' | null;
    userId: string;
    userName: string;
    newRole?: string;
    reason?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'ARTIST' | 'USER';
    createdAt?: string | Date;
    banned?: boolean;
    [key: string]: unknown;
}

export default function UserManagement() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const user = session?.user;
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'ADMIN' | 'ARTIST' | 'USER'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<{ total: number; pages: number; limit: number } | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
        open: false,
        action: null,
        userId: '',
        userName: '',
    });
    const [banReason, setBanReason] = useState('');
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Fetch users on mount or when filter changes
    useEffect(() => {
        setCurrentPage(1); // Reset to first page on filter change
    }, [filterRole]);

    const fetchUsersCallback = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/users?role=${filterRole}&page=${currentPage}&limit=10`);
            const result = await res.json();
            if (result.success) {
                setUsers(result.data);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersCallback();
    }, [filterRole, currentPage]);

    // Auto-dismiss notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);



    const showConfirmDialog = (action: 'ban' | 'unban' | 'role', userId: string, userName: string, newRole?: string) => {
        setConfirmDialog({
            open: true,
            action,
            userId,
            userName,
            newRole,
            reason: '',
        });
        setBanReason('');
    };

    const handleBanUser = async (userId: string, ban: boolean, reason?: string) => {
        try {
            setActionLoading(userId);
            const res = await fetch('/api/admin/users/ban', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    userId,
                    banned: ban,
                    reason: reason || (ban ? 'Banned by admin' : null),
                }),
            });
            const result = await res.json();
            if (result.success) {
                setNotification({
                    type: 'success',
                    message: `User ${ban ? 'banned' : 'unbanned'} successfully`,
                });
                fetchUsersCallback();
                setConfirmDialog({ ...confirmDialog, open: false });
            } else {
                setNotification({ type: 'error', message: result.error || 'Action failed' });
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to update user' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleChangeRole = async (userId: string, newRole: string) => {
        try {
            setActionLoading(userId);
            const res = await fetch('/api/admin/users/role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                    userId,
                    newRole,
                }),
            });
            const result = await res.json();
            if (result.success) {
                setNotification({
                    type: 'success',
                    message: `User role updated to ${newRole}`,
                });
                fetchUsersCallback();
                setConfirmDialog({ ...confirmDialog, open: false });
            } else {
                setNotification({ type: 'error', message: result.error || 'Action failed' });
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to update user role' });
        } finally {
            setActionLoading(null);
        }
    };

    const confirmAction = async () => {
        if (!confirmDialog.open) return;

        switch (confirmDialog.action) {
            case 'ban':
                await handleBanUser(confirmDialog.userId, true, banReason);
                break;
            case 'unban':
                await handleBanUser(confirmDialog.userId, false);
                break;
            case 'role':
                if (confirmDialog.newRole) {
                    await handleChangeRole(confirmDialog.userId, confirmDialog.newRole);
                }
                break;
        }
    };

    const filteredUsers = users.filter((u) =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user || !(user as any).roles?.includes('ADMIN')) {
        return (
            <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
                <h1 className="text-3xl font-bold">Admin Only</h1>
                <p className="text-zinc-400 mt-4">This page is restricted to administrators.</p>
                <Link href="/" className="text-emerald-400 mt-6 inline-block hover:underline">
                    Back to Home
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Link href="/admin" className="text-zinc-400 hover:text-white mb-4 inline-block">
                            ← Admin Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-zinc-400 mt-2">Manage users, ban accounts, control roles</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            id="user-search"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search users by name or email"
                            className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <div className="flex gap-2">
                            {(['all', 'ADMIN', 'ARTIST', 'USER'] as const).map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setFilterRole(role)}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${filterRole === role
                                        ? 'bg-emerald-500 text-black'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {role === 'all' ? 'All' : role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                                    <th className="px-6 py-4 text-left font-semibold">User</th>
                                    <th className="px-6 py-4 text-left font-semibold">Role</th>
                                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                                    <th className="px-6 py-4 text-left font-semibold">Joined</th>
                                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold">{u.name}</p>
                                                <p className="text-xs text-zinc-500">{u.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                id={`user-role-${u.id}`}
                                                value={u.role}
                                                onChange={(e) => showConfirmDialog('role', u.id, u.name, e.target.value)}
                                                disabled={actionLoading === u.id}
                                                aria-label={`Role for user ${u.name}`}
                                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                                            >
                                                <option value={u.role}>{u.role}</option>
                                                <option value="USER">User</option>
                                                <option value="ARTIST">Artist</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`text-xs font-bold px-2 py-1 rounded ${u.banned
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}
                                            >
                                                {u.banned ? 'Banned' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-zinc-500">
                                            {u.createdAt && typeof u.createdAt === 'string' ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => showConfirmDialog(u.banned ? 'unban' : 'ban', u.id, u.name)}
                                                disabled={actionLoading === u.id}
                                                className={`text-xs px-3 py-1 rounded transition disabled:opacity-50 ${u.banned
                                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40'
                                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/40'
                                                    }`}
                                            >
                                                {actionLoading === u.id ? 'Loading...' : u.banned ? 'Unban' : 'Ban'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-sm text-zinc-400">
                            Page {currentPage} of {pagination.pages} ({pagination.total} total)
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm font-semibold"
                            >
                                ← Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                                disabled={currentPage === pagination.pages}
                                className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm font-semibold"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="grid md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Total Users</p>
                        <p className="text-4xl font-bold mt-2">{users.length}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Admins</p>
                        <p className="text-4xl font-bold mt-2 text-blue-400">{users.filter((u) => (u.roles as any)?.includes('ADMIN')).length}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Artists</p>
                        <p className="text-4xl font-bold mt-2 text-emerald-400">{users.filter((u) => (u.roles as any)?.includes('ARTIST')).length}</p>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <p className="text-zinc-400 text-sm">Banned</p>
                        <p className="text-4xl font-bold mt-2 text-red-400">{users.filter((u) => u.banned).length}</p>
                    </div>
                </div>
            </div>
            {/* Confirmation Dialog & Notification */}
            {confirmDialog.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50">
                    <div className="bg-zinc-900 rounded-lg p-6 w-[420px] border border-zinc-800">
                        <h3 className="text-lg font-bold mb-2">Confirm Action</h3>
                        <p className="text-zinc-400 mb-4">Are you sure you want to {confirmDialog.action} <strong>{confirmDialog.userName}</strong>?</p>
                        {confirmDialog.action === 'ban' && (
                            <div className="mb-4">
                                <label className="text-sm text-zinc-400">Reason (optional)</label>
                                <input
                                    id="ban-reason"
                                    type="text"
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Optional: reason for ban"
                                    aria-label="Reason for banning user"
                                    className="w-full mt-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white"
                                />
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">Cancel</button>
                            <button onClick={confirmAction} className="px-3 py-2 rounded bg-red-600 hover:bg-red-500 text-white">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {notification && (
                <div className={`fixed bottom-6 right-6 p-4 rounded shadow-lg ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white`}>{notification.message}</div>
            )}
        </main>
    );
}
