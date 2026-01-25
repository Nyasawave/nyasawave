"use client";

import Link from "next/link";
import { useSongs } from "@/context/SongContext";
import EnhancedSongCard from "./EnhancedSongCard";

export default function RecommendedTracks() {
  const { songs } = useSongs();
  
  // Simple recommendation: shuffle and pick top 4 tracks
  const recommended = songs
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Recommended For You</h2>
        <Link href="/discover" className="text-emerald-400 text-sm">View More →</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommended.map((song) => (
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
    </div>
  );
}
