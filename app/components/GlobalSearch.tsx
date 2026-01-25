"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import { useSongs } from "@/context/SongContext";
import { useArtists } from "@/context/ArtistContext";

export default function GlobalSearch() {
  const { songs: allSongs } = useSongs();
  const { artists: allArtists } = useArtists();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const searchSongs = query.trim()
    ? allSongs
        .filter(
          (s) =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.artist.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const searchArtists = query.trim()
    ? allArtists
        .filter((a) =>
          a.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search songs, artists..."
        aria-label="Search songs and artists"
        className="w-full"
      />

      {isOpen && query.trim() && (
        <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
          {searchSongs.length > 0 && (
            <div className="border-b border-zinc-800 p-3">
              <p className="text-xs text-zinc-400 font-semibold mb-2">
                Songs
              </p>
              {searchSongs.map((song) => (
                <Link
                  key={song.id}
                  href={`/discover?search=${encodeURIComponent(
                    song.title
                  )}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-2 text-sm hover:bg-zinc-800 rounded"
                >
                  <p>{song.title}</p>
                  <p className="text-xs text-zinc-400">
                    {song.artist}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {searchArtists.length > 0 && (
            <div className="p-3">
              <p className="text-xs text-zinc-400 font-semibold mb-2">
                Artists
              </p>
              {searchArtists.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-2 text-sm hover:bg-zinc-800 rounded"
                >
                  <p>{artist.name}</p>
                  <p className="text-xs text-zinc-400">
                    {artist.genre}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {searchSongs.length === 0 &&
            searchArtists.length === 0 && (
              <div className="p-4 text-center text-sm text-zinc-400">
                No results found for "{query}"
              </div>
            )}
        </div>
      )}

      {isOpen && !query.trim() && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close search results"
          title="Close search results"
          className="fixed inset-0 z-30"
        />
      )}
    </div>
  );
}
