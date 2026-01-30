'use client';

export const dynamic = 'force-dynamic';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MarketerNav from '@/app/components/navigation/MarketerNav';
import RoleContextSwitcher from '@/app/components/RoleContextSwitcher';
import type { ExtendedSession } from '@/app/types/auth';

interface MarketerStats {
    activeCampaigns: number;
    totalReach: number;
    totalEarnings: number;
    conversionRate: number;
}

export default function MarketerDashboard() {
    const { data: session, status } = useSession() as { data: ExtendedSession | null; status: string };
    const router = useRouter();
    const [stats, setStats] = useState<MarketerStats | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            // Check if user has MARKETER role
            if (!session?.user?.roles?.includes('MARKETER')) {
                router.push('/');
            } else {
                fetchStats();
            }
        }
    }, [status, session, router]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/marketer/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching marketer stats:', error);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <p className="text-white">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header with Role Switcher */}
            <header className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Marketer Dashboard</h1>
                    <div className="flex gap-4 items-center">
                        <RoleContextSwitcher />
                        <button
                            onClick={() => signOut()}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar Navigation */}
                <MarketerNav />

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <div className="max-w-7xl">
                        <h2 className="text-3xl font-bold text-white mb-8">Welcome back, {(session?.user as any)?.name || 'Marketer'}!</h2>

                        {/* Stats Grid */}
                        {stats ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Active Campaigns Card */}
                                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                                    <h3 className="text-zinc-400 text-sm font-medium">Active Campaigns</h3>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {stats.activeCampaigns}
                                    </p>
                                </div>

                                {/* Total Reach Card */}
                                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                                    <h3 className="text-zinc-400 text-sm font-medium">Total Reach</h3>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {stats.totalReach.toLocaleString()}
                                    </p>
                                </div>

                                {/* Total Earnings Card */}
                                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                                    <h3 className="text-zinc-400 text-sm font-medium">Total Earnings</h3>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        ${stats.totalEarnings.toFixed(2)}
                                    </p>
                                </div>

                                {/* Conversion Rate Card */}
                                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                                    <h3 className="text-zinc-400 text-sm font-medium">Conversion Rate</h3>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {stats.conversionRate.toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-zinc-400">Loading stats...</div>
                        )}

                        {/* Active Campaigns Section */}
                        <div className="mt-8">
                            <h3 className="text-2xl font-bold text-white mb-4">Active Campaigns</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-green-500 transition-colors cursor-pointer">
                                        <h4 className="text-white font-semibold">Campaign {i}</h4>
                                        <p className="text-zinc-400 text-sm mt-2">Reach: {1000 * i} users</p>
                                        <p className="text-zinc-400 text-sm">Status: <span className="text-green-500">Active</span></p>
                                        <button className="mt-4 w-full bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600 transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
