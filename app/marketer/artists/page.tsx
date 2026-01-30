'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ExtendedSession } from '@/app/types/auth';

export default function MarketerArtistsPage() {
    const { data: session } = useSession() as { data: ExtendedSession | null };
    const router = useRouter();
    const [artists, setArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && !session.user?.roles?.includes('MARKETER')) {
            router.push('/unauthorized');
        }
    }, [session, router]);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const res = await fetch('/api/marketer/artists');
                if (res.ok) {
                    const data = await res.json();
                    setArtists(data);
                }
            } catch (error) {
                console.error('Error fetching artists:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading artists...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Featured Artists</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {artists.length > 0 ? (
                    artists.map(artist => (
                        <div key={artist.id} className="bg-zinc-900 rounded-lg p-6 text-center hover:bg-zinc-800 transition-colors cursor-pointer">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                                🎤
                            </div>
                            <h3 className="font-semibold text-lg">{artist.name}</h3>
                            <p className="text-sm text-zinc-400 mb-4">{artist.followers || 0} followers</p>
                            <button className="px-4 py-2 bg-green-500 text-black rounded-full text-sm font-semibold hover:bg-green-600 transition-colors">
                                Promote
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center text-zinc-400">
                        <p>No artists available yet. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
