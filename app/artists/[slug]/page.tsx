"use client";

import Link from "next/link";
import EnhancedSongCard from "../../components/EnhancedSongCard";
import FanSupport from "../../components/FanSupport";
import ArtistBoost from "../../components/ArtistBoost";
import FollowButton from "../../components/FollowButton";
import { useArtists } from "../../context/ArtistContext";
import { useSongs } from "../../context/SongContext";
import { useState } from "react";

export default function ArtistProfile({ params }: { params: { slug: string } }) {
  const { artists } = useArtists();
  const { songs } = useSongs();
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  
  const artist = artists.find((a) => a.slug === params.slug);
  if (!artist) {
    return (
      <main className="min-h-screen p-6 max-w-4xl mx-auto pt-32 text-center">
        <h1 className="text-3xl font-bold">Artist not found</h1>
        <p className="text-zinc-400 mt-2">We couldn't find that artist.</p>
        <Link href="/artists" className="mt-6 inline-block text-emerald-400">Back to Artists</Link>
      </main>
    );
  }

  const artistSongs = songs.filter((s) => s.artistId === artist.id);

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto pt-32">
      <div className="flex items-center gap-6 mb-8">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 flex items-center justify-center text-3xl text-white">
          {artist.name.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-4xl font-bold">{artist.name} {artist.verified ? <span className="text-emerald-400 text-sm">• Verified</span> : null}</h1>
          <p className="text-zinc-400 mt-1">{artist.genre} • {artist.followers?.toLocaleString() ?? 0} followers</p>
          <p className="text-zinc-400 mt-3 max-w-2xl">{artist.bio}</p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <FanSupport artistId={artist.id} artistName={artist.name} />
            <FollowButton artistId={artist.id} artistName={artist.name} />
          </div>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Top Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artistSongs.map((song) => (
            <EnhancedSongCard
              key={song.id}
              id={song.id}
              title={song.title}
              artist={song.artist}
              plays={song.plays}
              likes={song.likes}
              duration={song.duration}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">About</h2>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 mb-6">
          <p className="text-zinc-300">{artist.bio}</p>
        </div>

        {artist.upcoming && (
          <ArtistBoost
            artistName={artist.name}
            onBoost={() => setBoostMessage(`Boost campaign started for ${artist.name}!`)}
          />
        )}

        {boostMessage && (
          <div className="mt-4 p-3 rounded bg-emerald-900/30 border border-emerald-600/30 text-emerald-300 text-sm">
            {boostMessage}
          </div>
        )}
      </section>
    </main>
  );
}
