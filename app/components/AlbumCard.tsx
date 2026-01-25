"use client";

import Link from "next/link";

export default function AlbumCard({
  album,
}: {
  album: { title: string; artist: string; year?: number; cover?: string; slug?: string };
}) {
  return (
    <Link
      href={album.slug ? `/albums/${album.slug}` : `/artists`}
      className="block p-4 rounded-2xl bg-gradient-to-br from-zinc-900/60 to-zinc-900/40 border border-zinc-800 card-anim fade-in hover:shadow-lg hover:scale-[1.02]"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded overflow-hidden bg-zinc-700 flex-shrink-0">
          {album.cover ? (
            <img src={album.cover} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-200">🎵</div>
          )}
        </div>

        <div className="min-w-0">
          <p className="font-semibold truncate">{album.title}</p>
          <p className="text-sm text-zinc-400 truncate">{album.artist} • {album.year ?? "—"}</p>
        </div>
      </div>
    </Link>
  );
}
