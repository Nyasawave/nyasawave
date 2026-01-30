"use client";

import { useSession } from "next-auth/react";
import type { ExtendedSession } from "@/app/types/auth";
import SongsGrid from "./SongsGrid";
import ArtistCard from "./ArtistCard";
import AlbumCard from "./AlbumCard";
import NewsCard from "./NewsCard";

export default function DiscoverPrivate({ artists, songs, albums, news }: any) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const user = session?.user;

  if (!user) {
    return (
      <section className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
        <h3 className="text-lg font-semibold">More on NyasaWave</h3>
        <p className="text-zinc-400 mt-2">Sign in to see new songs, new artists, albums and more.</p>
        <div className="mt-4 flex gap-3">
          <a href="/signin" className="btn-cta bg-emerald-400 text-black">Sign in</a>
          <a href="/register" className="btn-cta border border-zinc-600 text-white">Create account</a>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">New Songs</h2>
        <SongsGrid songs={songs.slice().reverse()} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">New Artists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {artists.map((artist: any) => (
            <ArtistCard key={`new-${artist.slug ?? artist.name}`} artist={artist} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Albums</h2>
        {user.premiumListener ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {albums.map((al: any) => (
              <AlbumCard key={al.title} album={al} />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800">
            <p className="text-zinc-300">Albums are available for subscribed users.</p>
            <div className="mt-3">
              <a href="/subscribe" className="btn-cta bg-emerald-400 text-black">Subscribe</a>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Music News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((n: any) => (
            <NewsCard key={n.title} item={n} />
          ))}
        </div>
      </section>
    </div>
  );
}
