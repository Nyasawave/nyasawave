'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ExtendedSession } from '@/app/types/auth';

export default function ListenerProfilePage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !session.user?.roles?.includes('LISTENER')) {
            router.push('/unauthorized');
        }
        setLoading(false);
    }, [session, router]);

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="grid gap-6">
                {/* Profile Card */}
                <div className="bg-zinc-900 rounded-lg p-8">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center text-4xl">
                            👤
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{session?.user?.name || 'Listener'}</h2>
                            <p className="text-zinc-400">{session?.user?.email}</p>
                        </div>
                    </div>
                    <button className="px-6 py-2 bg-green-500 text-black rounded-full font-semibold hover:bg-green-600 transition-colors">
                        Edit Profile
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-zinc-400">Followers</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-zinc-400">Following</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-zinc-400">Playlists</div>
                    </div>
                    <div className="bg-zinc-900 rounded-lg p-4">
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-zinc-400">Points</div>
                    </div>
                </div>

                {/* Activity */}
                <div className="bg-zinc-900 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <p className="text-zinc-400">No activity yet. Start exploring and building your profile!</p>
                </div>
            </div>
        </div>
    );
}
