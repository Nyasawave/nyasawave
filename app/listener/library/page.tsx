'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ExtendedSession } from '@/app/types/auth';
import Link from 'next/link';

export default function ListenerLibraryPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [songs, setSongs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !session.user?.roles?.includes('LISTENER')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchLibrary = async () => {
            try {
                const res = await fetch('/api/listener/library');
                if (res.ok) {
                    const data = await res.json();
                    setSongs(data);
                }
            } catch (error) {
                console.error('Error fetching library:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLibrary();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading library...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">My Library</h1>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-zinc-900 rounded-lg p-4">
                    <div className="text-2xl font-bold">{songs.length}</div>
                    <div className="text-sm text-zinc-400">Saved Songs</div>
                </div>
                <div className="bg-zinc-900 rounded-lg p-4">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-zinc-400">Playlists</div>
                </div>
                <div className="bg-zinc-900 rounded-lg p-4">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-zinc-400">Liked Songs</div>
                </div>
            </div>

            {/* Songs List */}
            <h2 className="text-xl font-semibold mb-4">Recently Added</h2>
            {songs.length > 0 ? (
                <div className="space-y-2">
                    {songs.map((song: any) => (
                        <Link
                            key={song.id}
                            href={`/track/${song.id}`}
                            className="flex items-center gap-4 p-4 bg-zinc-900 rounded hover:bg-zinc-800 transition-colors"
                        >
                            <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center">🎵</div>
                            <div className="flex-1">
                                <p className="font-semibold">{song.title}</p>
                                <p className="text-sm text-zinc-400">{song.artist}</p>
                            </div>
                            <div className="text-sm text-zinc-500">{song.duration || '3:45'}</div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center text-zinc-400">
                    <p>Your library is empty. Start adding songs!</p>
                </div>
            )}
        </div>
    );
}
