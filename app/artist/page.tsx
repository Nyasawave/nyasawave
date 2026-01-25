'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ArtistDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalTracks: 0,
        totalStreams: 0,
        totalEarnings: 0,
        totalFans: 0,
    });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        }
        const userRoles = (session?.user as any)?.roles || [];
        if (session && !userRoles.includes('ARTIST') && !userRoles.includes('ADMIN')) {
            router.push('/');
        }
    }, [session, status, router]);

    useEffect(() => {
        // Fetch artist stats
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/artist/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch artist stats:', error);
            }
        };

        if (session?.user) {
            fetchStats();
        }
    }, [session]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-zinc-300">Loading...</div>
            </div>
        );
    }

    const userRoles = (session?.user as any)?.roles || [];
    if (!userRoles.includes('ARTIST') && !userRoles.includes('ADMIN')) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white">My Music Studio</h1>
                    <p className="text-zinc-400 mt-2">Manage your music and track your success</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Tracks', value: stats.totalTracks, icon: '🎵' },
                        { label: 'Total Streams', value: stats.totalStreams.toLocaleString(), icon: '▶️' },
                        { label: 'Earnings', value: `$${(stats.totalEarnings / 100).toFixed(2)}`, icon: '💰' },
                        { label: 'Fans', value: stats.totalFans, icon: '❤️' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-zinc-400 text-sm">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <div className="text-3xl">{stat.icon}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/artist/upload" className="flex items-center gap-3 p-4 bg-gray-700 rounded hover:bg-gray-600 transition">
                            <span className="text-2xl">⬆️</span>
                            <span className="text-sm font-medium text-white">Upload</span>
                        </Link>
                        <Link href="/artist/tracks" className="flex items-center gap-3 p-4 bg-gray-700 rounded hover:bg-gray-600 transition">
                            <span className="text-2xl">🎵</span>
                            <span className="text-sm font-medium text-white">My Tracks</span>
                        </Link>
                        <Link href="/artist/analytics" className="flex items-center gap-3 p-4 bg-gray-700 rounded hover:bg-gray-600 transition">
                            <span className="text-2xl">📊</span>
                            <span className="text-sm font-medium text-white">Analytics</span>
                        </Link>
                        <Link href="/artist/earnings" className="flex items-center gap-3 p-4 bg-gray-700 rounded hover:bg-gray-600 transition">
                            <span className="text-2xl">💰</span>
                            <span className="text-sm font-medium text-white">Earnings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
