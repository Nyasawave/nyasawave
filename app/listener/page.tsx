'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { ExtendedSession } from "@/app/types/auth";

export default function ListenerPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [recentPlays, setRecentPlays] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !session.user?.roles?.includes('LISTENER')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [playsRes, playlistsRes] = await Promise.all([
                    fetch("/api/listener/recent"),
                    fetch("/api/listener/playlists"),
                ]);

                if (playsRes.ok) {
                    const data = await playsRes.json();
                    setRecentPlays(data.plays || []);
                }
                if (playlistsRes.ok) {
                    const data = await playlistsRes.json();
                    setPlaylists(data.playlists || []);
                }
            } catch (error) {
                console.error("Failed to fetch listener data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.roles?.includes('LISTENER')) {
            fetchData();
        }
    }, [session]);

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold text-white mb-8">Your Music Dashboard</h1>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading your music...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Recently Played */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Recently Played</h2>
                            <div className="space-y-2">
                                {recentPlays.slice(0, 5).map((play: any) => (
                                    <div key={play.id} className="bg-zinc-900 rounded p-3 text-zinc-300 hover:bg-zinc-800 cursor-pointer transition">
                                        {play.title}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Playlists */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-white">Your Playlists</h2>
                                <Link href="/playlists/create" className="text-green-600 hover:text-green-400">
                                    Create New
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {playlists.slice(0, 5).map((playlist: any) => (
                                    <div key={playlist.id} className="bg-zinc-900 rounded p-3 text-zinc-300 hover:bg-zinc-800 cursor-pointer transition">
                                        {playlist.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
