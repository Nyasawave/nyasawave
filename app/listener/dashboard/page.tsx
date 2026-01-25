'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ListenerNav from '@/app/components/navigation/ListenerNav';
import RoleContextSwitcher from '@/app/components/RoleContextSwitcher';

interface ListenerStats {
    totalSongs: number;
    totalPlaylists: number;
    totalListeningHours: number;
    favoriteArtists: number;
}

export default function ListenerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<ListenerStats | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            // Check if user has LISTENER role
            if (!(session?.user as any)?.roles?.includes('LISTENER')) {
                router.push('/');
            } else {
                fetchStats();
            }
        }
    }, [status, session, router]);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/listener/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching listener stats:', error);
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
                    <h1 className="text-2xl font-bold text-white">Listener Dashboard</h1>
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
                <ListenerNav />

                {/* Main Content */}
                <main className="flex-1 p-8">
                    <div className="max-w-7xl">
                        <h2 className="text-3xl font-bold text-white mb-8">Welcome back, {(session?.user as any)?.name || 'Listener'}!</h2>

                        {/* Stats Grid */}
                        {stats ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Total Songs Card */}
                                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                                    <h3 className="text-zinc-400 text-sm font-medium">Saved Songs</h3>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {stats.totalSongs}
                                    </p>
                                </div>

                                {/* Playlists Card */}
                                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                                    <h3 className="text-zinc-400 text-sm font-medium">Playlists</h3>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {stats.totalPlaylists}
                                    </p>
                                </div>

                                {/* Listening Hours Card */}
                                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                                    <h3 className="text-zinc-400 text-sm font-medium">Listening Hours</h3>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {stats.totalListeningHours}
                                    </p>
                                </div>

                                {/* Favorite Artists Card */}
                                <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                                    <h3 className="text-zinc-400 text-sm font-medium">Favorite Artists</h3>
                                    <p className="text-3xl font-bold text-white mt-2">
                                        {stats.favoriteArtists}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-zinc-400">Loading stats...</div>
                        )}

                        {/* Featured Music Section */}
                        <div className="mt-8">
                            <h3 className="text-2xl font-bold text-white mb-4">Featured Music</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-green-500 transition-colors cursor-pointer">
                                        <div className="bg-zinc-800 rounded h-32 mb-4 flex items-center justify-center">
                                            <span className="text-zinc-600">Album Art</span>
                                        </div>
                                        <h4 className="text-white font-semibold">Song Title {i}</h4>
                                        <p className="text-zinc-400 text-sm">Artist Name</p>
                                        <button className="mt-4 w-full bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600 transition-colors">
                                            Play
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
