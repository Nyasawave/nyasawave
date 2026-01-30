'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ExtendedSession } from '@/app/types/auth';

interface SystemStats {
    totalUsers: number;
    totalRevenue: number;
    pendingPayouts: number;
    activeDisputes: number;
    failedTransactions: number;
    activeAuctions: number;
}

interface AdminUser {
    id: string;
    email: string;
    roles: string[];
    verified: boolean;
    createdAt: string;
}

interface Transaction {
    id: string;
    userId: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
}

export default function AdminToolsPage() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
    const router = useRouter();
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [impersonatingUser, setImpersonatingUser] = useState<string | null>(null);
    const [manualPayoutAmount, setManualPayoutAmount] = useState('');
    const [manualPayoutUserId, setManualPayoutUserId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Redirect if not admin
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
        if (
            session &&
            !(session.user as any)?.roles?.includes('ADMIN')
        ) {
            router.push('/');
        }
    }, [session, status, router]);

    // Fetch dashboard data
    useEffect(() => {
        if (session && (session.user as any)?.roles?.includes('ADMIN')) {
            fetchStats();
            fetchUsers();
            fetchTransactions();
        }
    }, [session]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await fetch('/api/admin/transactions');
            if (res.ok) {
                const data = await res.json();
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }
    };

    const handleImpersonate = async (userId: string) => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            if (res.ok) {
                setImpersonatingUser(userId);
                setMessage('✅ Now impersonating user. Changes will be limited.');
            } else {
                setMessage('❌ Failed to impersonate user');
            }
        } catch (error) {
            setMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown'));
        } finally {
            setLoading(false);
        }
    };

    const handleManualPayout = async () => {
        if (!manualPayoutUserId || !manualPayoutAmount) {
            setMessage('❌ Please fill in both User ID and Amount');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/admin/manual-payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: manualPayoutUserId,
                    amount: parseFloat(manualPayoutAmount),
                    reason: 'Manual admin payout',
                }),
            });

            if (res.ok) {
                setMessage('✅ Manual payout processed successfully');
                setManualPayoutAmount('');
                setManualPayoutUserId('');
                fetchStats();
            } else {
                const error = await res.json();
                setMessage(`❌ Failed: ${error.error}`);
            }
        } catch (error) {
            setMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown'));
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!(session?.user as any)?.roles?.includes('ADMIN')) {
        return <div className="p-8 text-center text-red-600">Unauthorized</div>;
    }

    return (
        <main className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">🛠️ Admin Tools</h1>
                    <p className="text-gray-400">System management, user management, and dispute resolution</p>
                    {impersonatingUser && (
                        <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-600 rounded">
                            ⚠️ Currently impersonating user {impersonatingUser}
                        </div>
                    )}
                </div>

                {message && (
                    <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded">
                        {message}
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-8 flex gap-4 border-b border-gray-700">
                    {['overview', 'users', 'payments', 'disputes', 'impersonate', 'payout'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-semibold transition ${activeTab === tab
                                ? 'text-yellow-400 border-b-2 border-yellow-400'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && stats && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">System Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                                <div className="text-gray-400 mb-2">Total Users</div>
                                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                                <div className="text-gray-400 mb-2">Total Revenue</div>
                                <div className="text-3xl font-bold">MWK {stats.totalRevenue.toLocaleString()}</div>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                                <div className="text-gray-400 mb-2">Pending Payouts</div>
                                <div className="text-3xl font-bold text-orange-400">{stats.pendingPayouts}</div>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                                <div className="text-gray-400 mb-2">Active Disputes</div>
                                <div className="text-3xl font-bold text-red-400">{stats.activeDisputes}</div>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                                <div className="text-gray-400 mb-2">Failed Transactions</div>
                                <div className="text-3xl font-bold text-red-400">{stats.failedTransactions}</div>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                                <div className="text-gray-400 mb-2">Active Tournaments</div>
                                <div className="text-3xl font-bold">{stats.activeAuctions}</div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Link href="/admin/users" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition text-center">
                                    👥 Manage Users
                                </Link>
                                <Link href="/admin/artists" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition text-center">
                                    🎤 Artists
                                </Link>
                                <Link href="/admin/payments" className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition text-center">
                                    💰 Payments
                                </Link>
                                <Link href="/admin/moderation" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition text-center">
                                    🚫 Moderation
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">User Management</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-2">Email</th>
                                        <th className="px-4 py-2">Roles</th>
                                        <th className="px-4 py-2">Verified</th>
                                        <th className="px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.slice(0, 20).map((user) => (
                                        <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800">
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2 text-xs">{user.roles.join(', ')}</td>
                                            <td className="px-4 py-2">{user.verified ? '✅' : '❌'}</td>
                                            <td className="px-4 py-2">
                                                <button
                                                    onClick={() => handleImpersonate(user.id)}
                                                    disabled={loading}
                                                    className="text-blue-400 hover:text-blue-300 disabled:opacity-50"
                                                >
                                                    Impersonate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* DISPUTES TAB */}
                {activeTab === 'disputes' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Dispute Resolution</h2>
                        <Link
                            href="/admin/disputes"
                            className="inline-block bg-red-600 hover:bg-red-700 px-6 py-2 rounded mb-6 transition"
                        >
                            📋 View All Disputes
                        </Link>
                        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                            <p className="text-gray-400">Advanced dispute management available in dedicated dashboard</p>
                        </div>
                    </div>
                )}

                {/* IMPERSONATE TAB */}
                {activeTab === 'impersonate' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">⚠️ Impersonate User</h2>
                        <div className="max-w-md bg-gray-800 p-6 rounded-lg border border-gray-700">
                            <p className="text-gray-400 mb-6">
                                Temporarily act as another user to troubleshoot issues or test features. All actions will be logged.
                            </p>
                            <input
                                type="text"
                                placeholder="User ID or Email"
                                className="w-full px-4 py-2 bg-gray-700 rounded mb-4 text-white placeholder-gray-400"
                            />
                            <button
                                onClick={() =>
                                    handleImpersonate(
                                        (document.querySelector('input[placeholder="User ID or Email"]') as HTMLInputElement)?.value || ''
                                    )
                                }
                                disabled={loading}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-semibold transition disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Start Impersonation'}
                            </button>
                        </div>
                    </div>
                )}

                {/* PAYOUT TAB */}
                {activeTab === 'payout' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Manual Payout</h2>
                        <div className="max-w-md bg-gray-800 p-6 rounded-lg border border-gray-700">
                            <p className="text-gray-400 mb-6">
                                Manually credit user account. Use only for refunds or adjustments. Will be audited.
                            </p>
                            <input
                                type="text"
                                placeholder="User ID"
                                value={manualPayoutUserId}
                                onChange={(e) => setManualPayoutUserId(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 rounded mb-4 text-white placeholder-gray-400"
                            />
                            <input
                                type="number"
                                placeholder="Amount (MWK)"
                                value={manualPayoutAmount}
                                onChange={(e) => setManualPayoutAmount(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 rounded mb-4 text-white placeholder-gray-400"
                            />
                            <button
                                onClick={handleManualPayout}
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold transition disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Process Payout'}
                            </button>
                        </div>
                    </div>
                )}

                {/* PAYMENTS TAB */}
                {activeTab === 'payments' && (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 border-b border-gray-700">
                                    <tr>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice(0, 20).map((tx) => (
                                        <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-800">
                                            <td className="px-4 py-2 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                            <td className="px-4 py-2">{tx.type}</td>
                                            <td className="px-4 py-2 font-semibold">MWK {tx.amount.toLocaleString()}</td>
                                            <td className="px-4 py-2">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${tx.status === 'COMPLETED'
                                                        ? 'bg-green-900/30 text-green-400'
                                                        : 'bg-yellow-900/30 text-yellow-400'
                                                        }`}
                                                >
                                                    {tx.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
