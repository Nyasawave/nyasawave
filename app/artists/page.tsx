"use client";

import { useArtists } from "@/context/ArtistContext";
import ArtistCard from "@/components/ArtistCard";
import UpcomingArtistCard from "@/components/UpcomingArtistCard";
import Link from "next/link";

export default function Artists() {
  const { artists } = useArtists();
  return (
    <main className="p-6 space-y-8 max-w-7xl mx-auto pt-32">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Artists</h1>
          <p className="text-zinc-400">Discover talented artists on NyasaWave.</p>
        </div>
        <Link href="/discover" className="text-emerald-400">Explore</Link>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Featured Artists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.slice(0,8).map((a) => (
            <ArtistCard key={a.id} artist={{ name: a.name, genre: a.genre, slug: a.slug }} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Spotlight</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {artists.filter(a=>a.upcoming).slice(0,4).map((a) => (
            <UpcomingArtistCard key={a.id} id={a.id} name={a.name} slug={a.slug} genre={a.genre} monthlyListeners={a.monthlyListeners||0} />
          ))}
        </div>
      </section>
    </main>
  );
}
