'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ListenerDiscoverPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('all');

    const genres = ['all', 'afrobeats', 'hiphop', 'jazz', 'gospel', 'amapiano', 'highlife'];

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const query = selectedGenre !== 'all' ? `?genre=${selectedGenre}` : '';
                const res = await fetch(`/api/discover${query}`);
                if (res.ok) {
                    const data = await res.json();
                    setTracks(data);
                }
            } catch (error) {
                console.error('Error fetching tracks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, [selectedGenre]);

    if (loading) return <div className="p-8 text-center">Discovering music...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Discover New Music</h1>

            {/* Genre Filter */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-4">
                {genres.map(genre => (
                    <button
                        key={genre}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedGenre === genre
                            ? 'bg-green-500 text-black font-semibold'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                    >
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tracks Grid */}
            {tracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tracks.map(track => (
                        <Link
                            key={track.id}
                            href={`/track/${track.id}`}
                            className="bg-zinc-900 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
                        >
                            <div className="aspect-square bg-zinc-800 rounded mb-4 flex items-center justify-center">
                                <span className="text-4xl">🎵</span>
                            </div>
                            <h3 className="font-semibold truncate">{track.title}</h3>
                            <p className="text-sm text-zinc-400 truncate">{track.artist}</p>
                            <p className="text-xs text-zinc-500 mt-2">{track.plays || 0} plays</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center text-zinc-400">
                    <p>No tracks found. Check back soon!</p>
                </div>
            )}
        </div>
    );
}
