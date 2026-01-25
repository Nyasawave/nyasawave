'use client';

import { useEffect, useState } from 'react';

interface SystemStats {
    totalUsers: number;
    totalArtists: number;
    totalListeners: number;
    totalTracks: number;
    totalRevenue: number;
    pendingPayouts: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading dashboard...</div>;
    }

    if (!stats) {
        return <div className="text-center py-8 text-red-600">Failed to load dashboard stats</div>;
    }

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Users Card */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <h3 className="text-zinc-400 text-sm font-medium">Total Users</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        {stats.totalUsers}
                    </p>
                </div>

                {/* Total Artists Card */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <h3 className="text-zinc-400 text-sm font-medium">Total Artists</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        {stats.totalArtists}
                    </p>
                </div>

                {/* Total Listeners Card */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <h3 className="text-zinc-400 text-sm font-medium">Total Listeners</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        {stats.totalListeners}
                    </p>
                </div>

                {/* Total Tracks Card */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <h3 className="text-zinc-400 text-sm font-medium">Total Tracks</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        {stats.totalTracks}
                    </p>
                </div>

                {/* Total Revenue Card */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <h3 className="text-zinc-400 text-sm font-medium">Total Revenue</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        ${stats.totalRevenue.toFixed(2)}
                    </p>
                </div>

                {/* Pending Payouts Card */}
                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                    <h3 className="text-zinc-400 text-sm font-medium">Pending Payouts</h3>
                    <p className="text-3xl font-bold text-white mt-2">
                        ${stats.pendingPayouts.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                        Review Pending Transactions
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                        Process Payouts
                    </button>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors">
                        View System Logs
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors">
                        Access Supertools
                    </button>
                </div>
            </div>
        </div>
    );
}
