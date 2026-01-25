"use client";

import Link from "next/link";

export default function ArtistCard({
  artist,
}: {
  artist: { name: string; genre?: string; slug?: string; avatar?: string };
}) {
  return (
    <Link
      href={artist.slug ? `/artists/${artist.slug}` : `/artists`}
      className="block p-4 rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800 card-anim fade-in hover:shadow-lg hover:scale-[1.02]"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-600 overflow-hidden flex-shrink-0 flex items-center justify-center text-xl text-zinc-200 ring-1 ring-zinc-800">
          {artist.avatar ? (
            <img src={artist.avatar} alt={artist.name} className="w-full h-full object-cover" />
          ) : (
            artist.name.charAt(0)
          )}
        </div>

        <div className="min-w-0">
          <p className="font-semibold truncate">{artist.name}</p>
          <p className="text-sm text-zinc-400 truncate">{artist.genre ?? "Artist"}</p>
        </div>
      </div>
    </Link>
  );
}
