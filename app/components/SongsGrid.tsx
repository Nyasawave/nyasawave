"use client";

import { useEffect } from "react";
import SongCard from "./SongCard";
import { usePlayer, Song } from "../context/PlayerContext";

export default function SongsGrid({ songs = [] }: { songs?: Song[] }) {
  const { setQueue } = usePlayer() as { setQueue?: (s: Song[]) => void };

  useEffect(() => {
    // keep player's queue in sync when available
    if (Array.isArray(songs) && songs.length && typeof setQueue === "function") {
      setQueue(songs);
    }
  }, [songs, setQueue]);

  if (!songs || songs.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-400">
        No tracks found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
