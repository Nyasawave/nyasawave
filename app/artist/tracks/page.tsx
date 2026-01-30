'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ExtendedSession } from "@/app/types/auth";

export default function ArtistTracksPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !(session.user as any)?.roles?.includes('ARTIST')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await fetch(`/api/artist/tracks?artistId=${(session?.user as any)?.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setTracks(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Failed to fetch tracks:", error);
            } finally {
                setLoading(false);
            }
        };

        if ((session?.user as any)?.roles?.includes('ARTIST')) {
            fetchTracks();
        }
    }, [session]);

    return (
        <main className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-white">My Tracks</h1>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading tracks...</p>
                    </div>
                ) : tracks.length === 0 ? (
                    <div className="bg-zinc-900 rounded-lg p-12 text-center">
                        <p className="text-zinc-400 mb-4">You haven't uploaded any tracks yet</p>
                        <a
                            href="/artist/upload"
                            className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                        >
                            Upload Your First Track
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tracks.map((track: any) => (
                            <div key={track.id} className="bg-zinc-900 rounded-lg p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="text-white font-semibold">{track.title}</h3>
                                    <p className="text-zinc-400 text-sm">{track.plays || 0} plays</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-semibold">${track.earnings || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
