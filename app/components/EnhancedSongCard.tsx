"use client";

import { Play, Heart } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

interface EnhancedSongCardProps {
  id: string;
  title: string;
  artist: string;
  plays: number;
  likes: number;
  duration: number;
}

export default function EnhancedSongCard({
  id,
  title,
  artist,
  plays,
  likes,
  duration,
}: EnhancedSongCardProps) {
  const { setSong } = usePlayer();

  const formatNumber = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="group rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 hover:border-emerald-400 transition p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-white truncate text-sm">
            {title}
          </h4>
          <p className="text-xs text-zinc-400 truncate">
            {artist}
          </p>
        </div>

        {/* Play button */}
        <button
          type="button"
          onClick={() =>
            setSong({
              title,
              artist,
              src: `/audio/sample.mp3`,
            })
          }
          aria-label={`Play ${title} by ${artist}`}
          title={`Play ${title}`}
          className="ml-2 p-2 rounded-full bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400 hover:text-black transition opacity-0 group-hover:opacity-100"
        >
          <Play size={14} fill="currentColor" />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{formatDuration(duration)}</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart size={12} />
            {formatNumber(likes)}
          </span>
          <span>{formatNumber(plays)}</span>
        </span>
      </div>
    </div>
  );
}
