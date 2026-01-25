'use client';

import Link from 'next/link';
import { usePlayer } from '../../context/PlayerContext';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { useState, useEffect, useCallback } from 'react';
import { songs } from '@/data/songs';

interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  url: string;
  cover?: string;
  coverArt?: string;
  genre?: string;
  description?: string;
  plays: number;
  likes: number;
  [key: string]: unknown;
}

export default function TrackDetail({ params }: { params: { id: string } }) {
  const { currentSong, isPlaying } = usePlayer();
  const { playTrack } = useAudioPlayer();
  const [track, setTrack] = useState<Track | null>(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTrack = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/artist/releases/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTrack(data);
      }
    } catch (err) {
      console.error('Failed to load track', err);
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchTrack();
  }, [fetchTrack]);

  if (loading) return <div className="min-h-screen pt-32 text-center text-zinc-400">Loading...</div>;
  if (!track) return <div className="min-h-screen pt-32 text-center text-zinc-400">Track not found</div>;

  const isCurrentlyPlaying = currentSong?.id === track.id && isPlaying;

  const handlePlay = () => {
    playTrack({
      id: track.id,
      title: track.title,
      artist: track.artist,
      url: track.url,
      coverArt: track.coverArt,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Link */}
        <Link href="/discover" className="text-emerald-400 hover:underline mb-8 inline-block">
          ← Back to Discover
        </Link>

        {/* Track Hero */}
        <div className="grid md:grid-cols-2 gap-12 mb-16 items-start">
          {/* Cover Art */}
          <div>
            <img
              src={(track.cover || track.coverArt) as string}
              alt={track.title}
              className="w-full rounded-lg shadow-2xl aspect-square object-cover bg-zinc-700"
            />
          </div>

          {/* Track Info */}
          <div>
            <p className="text-emerald-400 text-sm font-semibold uppercase mb-2">{(track.genre || 'Music') as string}</p>
            <h1 className="text-5xl font-bold mb-4">{track.title}</h1>
            <Link
              href={`/artist/${track.artistId || 'unknown'}`}
              className="text-xl text-zinc-300 hover:text-white transition mb-8 inline-block"
            >
              By {track.artist}
            </Link>

            {/* Description */}
            <p className="text-zinc-300 mb-8 leading-relaxed">{(track.description || 'No description') as string}</p>

            {/* Stats */}
            <div className="flex gap-8 mb-8 py-6 border-t border-b border-zinc-800">
              <div>
                <p className="text-zinc-400 text-sm">Plays</p>
                <p className="text-2xl font-bold text-emerald-400">{(track.plays || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Likes</p>
                <p className="text-2xl font-bold text-pink-400">{liked ? (track.likes || 0) + 1 : (track.likes || 0)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handlePlay}
                className={`flex-1 py-4 rounded-lg font-bold transition text-lg ${isCurrentlyPlaying
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400'
                  }`}
              >
                {isCurrentlyPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={`px-6 py-4 rounded-lg font-bold transition ${liked
                  ? 'bg-pink-500 text-white'
                  : 'bg-zinc-800 text-white hover:bg-zinc-700'
                  }`}
              >
                {liked ? '❤️ Liked' : '🤍 Like'}
              </button>
            </div>

            {/* Share Button */}
            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-semibold transition">
              📤 Share
            </button>
          </div>
        </div>

        {/* More from Artist */}
        <div>
          <h2 className="text-2xl font-bold mb-6">More from {track.artist}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {songs
              .filter((t) => t.artistId === track.artistId && t.id !== track.id)
              .slice(0, 3)
              .map((t) => (
                <Link key={t.id} href={`/track/${t.id}`} className="group cursor-pointer">
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={t.cover}
                      alt={t.title}
                      className="w-full aspect-square object-cover group-hover:scale-110 transition duration-300 bg-zinc-700"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        playTrack({
                          id: t.id,
                          title: t.title,
                          artist: t.artist,
                          url: t.src || t.streamUrl || '',
                          coverArt: t.cover,
                        });
                      }}
                      className="absolute bottom-4 right-4 bg-emerald-500 text-black p-3 rounded-full opacity-0 group-hover:opacity-100 transition transform group-hover:scale-110"
                      aria-label="Play song"
                    >
                      ▶
                    </button>
                  </div>
                  <h3 className="font-semibold group-hover:text-emerald-400 transition">{t.title}</h3>
                  <p className="text-sm text-zinc-400">{t.artist}</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
