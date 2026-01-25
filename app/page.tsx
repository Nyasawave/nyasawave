"use client";

import { useArtists } from "./context/ArtistContext";
import { useSongs } from "./context/SongContext";
import EnhancedSongCard from "./components/EnhancedSongCard";
import UpcomingArtistCard from "./components/UpcomingArtistCard";
import FeatureCard from "./components/FeatureCard";
import RecommendedTracks from "./components/RecommendedTracks";
import Link from "next/link";

export default function Home() {
  const { artists, loading: artistsLoading } = useArtists();
  const { songs, loading: songsLoading } = useSongs();
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white">
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Nyasa<span className="text-emerald-400">Wave</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg md:text-xl text-zinc-300">
          Discover, stream, and support African sounds — rising from the heart of the continent.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="#featured" className="btn-cta bg-emerald-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-emerald-300 transition">
            Start Listening
          </Link>

          <Link href="/artist/signin" className="btn-cta border border-zinc-600 text-white bg-transparent px-8 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition">
            For Artists
          </Link>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto">
        <Feature
          title="Stream Freely"
          desc="Enjoy music without barriers, anytime, anywhere."
        />
        <Feature
          title="Support Artists"
          desc="Every play helps creators grow and earn."
        />
        <Feature
          title="African First"
          desc="Built for the culture, powered by the wave."
        />
      </section>

      {/* UPCOMING ARTISTS */}
      <section className="mt-32 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Upcoming Artists</h2>
          <Link href="/discover?type=upcoming" className="text-emerald-400 hover:text-emerald-300 text-sm">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {artists.filter((a) => a.upcoming).slice(0, 4).map((artist) => (
            <UpcomingArtistCard
              key={artist.id}
              id={artist.id}
              name={artist.name}
              slug={artist.slug}
              genre={artist.genre}
              monthlyListeners={artist.monthlyListeners || 0}
            />
          ))}
        </div>
      </section>

      {/* FEATURED SONGS SECTION */}
      <section id="featured" className="mt-32 px-6 max-w-6xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Featured Tracks</h2>
          <Link href="/discover" className="text-emerald-400 hover:text-emerald-300 text-sm">
            Explore More →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.slice(0, 6).map((song) => (
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

      {/* RECOMMENDED TRACKS */}
      <section className="mt-20 px-6 max-w-6xl mx-auto pb-12">
        <RecommendedTracks />
      </section>

      {/* ARTIST x BUSINESS SECTION */}
      <section className="mt-32 px-6 max-w-6xl mx-auto pb-32">
        <h2 className="text-3xl font-bold mb-8">For Business & Brands</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FeatureCard
            icon="target"
            title="Artist Matchmaking"
            description="Connect with artists perfect for your brand, events, and campaigns."
          />
          <FeatureCard
            icon="chart"
            title="Analytics & Insights"
            description="Deep insights into listener demographics and engagement metrics."
          />
        </div>
        <Link href="/business" className="inline-block mt-6 bg-emerald-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-emerald-300 transition">
          Explore Artist Partnerships →
        </Link>
      </section>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-zinc-400">{desc}</p>
    </div>
  );
}
