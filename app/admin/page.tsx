'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ExtendedSession } from '@/app/types/auth';

export default function AdminDashboard() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
    const user = session?.user;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Wait for session to load
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        if (status !== 'loading') {
            setIsLoading(false);
        }

        return () => clearTimeout(timer);
    }, [status]);

    // Show loading state while checking authentication
    if (isLoading || status === 'loading') {
        return (
            <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
                <div className="inline-block">
                    <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-zinc-400 mt-4">Loading...</p>
            </main>
        );
    }

    // Show error if not admin
    if (!session?.user || !(session.user as any)?.roles?.includes('ADMIN')) {
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

    const adminStats = [
        { label: 'Total Artists', value: '284', change: '+12 this week' },
        { label: 'Active Boosts', value: '47', change: '+5 today' },
        { label: 'Revenue (MWK)', value: '2.3M', change: '+450K this month' },
        { label: 'Total Streams', value: '1.2M', change: '+320K today' },
        { label: 'Pending Payouts', value: '18', change: '~500K total' },
        { label: 'Reports', value: '3', change: 'Needs review' },
    ];

    const panels = [
        {
            title: 'Artists Management',
            icon: '👤',
            description: 'Manage artist accounts, verify identities, handle disputes',
            href: '/admin/artists',
            color: 'emerald',
        },
        {
            title: 'User Management',
            icon: '👥',
            description: 'Manage users, ban accounts, control roles',
            href: '/admin/users',
            color: 'blue',
        },
        {
            title: 'Track Moderation',
            icon: '🎵',
            description: 'Review tracks, remove explicit content, approve releases',
            href: '/admin/tracks',
            color: 'pink',
        },
        {
            title: 'Payments & Payouts',
            icon: '💰',
            description: 'Process withdrawals, manage payment methods, track revenue',
            href: '/admin/payments',
            color: 'green',
        },
        {
            title: 'Boost Management',
            icon: '🚀',
            description: 'Approve boosts, prevent fraud, analyze ROI',
            href: '/admin/boosts',
            color: 'purple',
        },
        {
            title: 'Reports & Analytics',
            icon: '📊',
            description: 'Platform metrics, revenue analytics, district breakdown',
            href: '/admin/reports',
            color: 'red',
        },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                        <p className="text-zinc-400 mt-2">Platform management & moderation center</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-zinc-400">Welcome back, {(user as any)?.name}</p>
                        <button
                            onClick={() => {
                                // TODO: Implement logout
                                router.push('/');
                            }}
                            className="text-xs text-zinc-500 hover:text-white mt-2 transition"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
                    {adminStats.map((stat, idx) => (
                        <div key={idx} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                            <p className="text-zinc-400 text-xs font-semibold">{stat.label}</p>
                            <p className="text-2xl font-bold mt-2">{stat.value}</p>
                            <p className="text-xs text-zinc-500 mt-1">{stat.change}</p>
                        </div>
                    ))}
                </div>

                {/* Management Panels */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {panels.map((panel, idx) => {
                        const colorMap = {
                            emerald: 'from-emerald-900/50 to-emerald-800/50 border-emerald-700 hover:border-emerald-600',
                            blue: 'from-blue-900/50 to-blue-800/50 border-blue-700 hover:border-blue-600',
                            green: 'from-green-900/50 to-green-800/50 border-green-700 hover:border-green-600',
                            pink: 'from-pink-900/50 to-pink-800/50 border-pink-700 hover:border-pink-600',
                            purple: 'from-purple-900/50 to-purple-800/50 border-purple-700 hover:border-purple-600',
                            red: 'from-red-900/50 to-red-800/50 border-red-700 hover:border-red-600',
                        };

                        return (
                            <Link
                                key={idx}
                                href={panel.href}
                                className={`bg-gradient-to-br ${colorMap[panel.color as keyof typeof colorMap]} rounded-lg p-6 border transition cursor-pointer`}
                            >
                                <div className="text-4xl mb-3">{panel.icon}</div>
                                <h3 className="text-lg font-bold mb-2">{panel.title}</h3>
                                <p className="text-sm text-zinc-400 mb-4">{panel.description}</p>
                                <div className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                                    Access Panel <span>→</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Recent Activity */}
                <div className="mt-12 grid md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <h2 className="text-xl font-bold mb-6">Recent Artist Signups</h2>
                        <div className="space-y-3">
                            {[
                                { name: 'Tinowofa Records', date: '2 hours ago', status: 'Pending Verification' },
                                { name: 'Sister Anne Music', date: '5 hours ago', status: 'Verified' },
                                { name: 'Malawi Beats Collective', date: 'Yesterday', status: 'Verified' },
                            ].map((artist, idx) => (
                                <div key={idx} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{artist.name}</p>
                                        <p className="text-xs text-zinc-500">{artist.date}</p>
                                    </div>
                                    <span
                                        className={`text-xs font-bold px-2 py-1 rounded ${artist.status === 'Verified'
                                            ? 'bg-emerald-500/20 text-emerald-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                            }`}
                                    >
                                        {artist.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                        <h2 className="text-xl font-bold mb-6">Pending Actions</h2>
                        <div className="space-y-3">
                            {[
                                { action: 'Approve Boost', item: '"Summer Vibes" - 72h Global', priority: 'HIGH' },
                                { action: 'Review Track', item: '"Midnight Dreams" - Content Review', priority: 'MEDIUM' },
                                { action: 'Process Payout', item: '18 withdrawal requests pending', priority: 'HIGH' },
                            ].map((task, idx) => (
                                <div key={idx} className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="font-semibold text-sm">{task.action}</p>
                                        <span
                                            className={`text-xs font-bold px-2 py-0.5 rounded ${task.priority === 'HIGH'
                                                ? 'bg-red-500/20 text-red-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                                }`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500">{task.item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
